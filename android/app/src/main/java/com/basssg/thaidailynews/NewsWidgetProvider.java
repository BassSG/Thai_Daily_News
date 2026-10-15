package com.basssg.thaidailynews;

import android.app.*;
import android.appwidget.*;
import android.content.*;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;
import org.json.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class NewsWidgetProvider extends AppWidgetProvider {
    static final int MAX_STORIES=20;
    public static final String[] CATEGORY_IDS={"all","politics","society","crime","economy","world","tech"};
    public static final String[] CATEGORY_LABELS={"ทุกหมวด","การเมือง","สังคม","อาชญากรรม","เศรษฐกิจ","ต่างประเทศ","เทคโนโลยี"};
    public static final String[] MODE_LABELS={"ข่าวล่าสุด","ข่าวที่ต้องรู้","ข่าวที่บันทึกไว้"};
    static JSONObject config(Context c,int id){try{return new JSONObject(NewsRepository.prefs(c).getString("widget_"+id,"{}"));}catch(Exception e){return new JSONObject();}}
    static String kind(AppWidgetProviderInfo info){return info.provider.getClassName().endsWith("SmallWidget")?"small":info.provider.getClassName().endsWith("LargeWidget")?"large":"medium";}
    static boolean owned(Context c,AppWidgetProviderInfo info){return info!=null&&info.provider.getPackageName().equals(c.getPackageName())&&(info.provider.getClassName().equals(SmallWidget.class.getName())||info.provider.getClassName().equals(MediumWidget.class.getName())||info.provider.getClassName().equals(LargeWidget.class.getName()));}
    public static void updateAll(Context c){AppWidgetManager manager=AppWidgetManager.getInstance(c);for(Class<?> provider:new Class<?>[]{SmallWidget.class,MediumWidget.class,LargeWidget.class})for(int id:manager.getAppWidgetIds(new ComponentName(c,provider)))update(c,manager,id);}
    @SuppressWarnings("deprecation")
    static void update(Context c,AppWidgetManager manager,int id){AppWidgetProviderInfo info=manager.getAppWidgetInfo(id);if(!owned(c,info))return;manager.updateAppWidget(id,createViews(c,id,kind(info),manager.getAppWidgetOptions(id)));if(Build.VERSION.SDK_INT<31&&kind(info).equals("large"))manager.notifyAppWidgetViewDataChanged(id,R.id.widget_list);}

    static List<JSONObject> selected(Context c,int id){
        JSONObject cfg=config(c,id);String mode=cfg.optString("mode","latest"),category=cfg.optString("category","all");
        JSONArray source=mode.equals("saved")?NewsRepository.bookmarks(c):NewsRepository.cached(c).optJSONArray("items");
        ArrayList<JSONObject> items=new ArrayList<>();if(source!=null)for(int i=0;i<source.length();i++){JSONObject it=source.optJSONObject(i);if(it!=null&&(category.equals("all")||category.equals(it.optString("category_id")))&&(!mode.equals("important")||it.optBoolean("alert_eligible")))items.add(it);}
        if(mode.equals("important"))items.sort((a,b)->Double.compare(b.optDouble("score"),a.optDouble("score")));
        else items.sort((a,b)->Long.compare(NewsRepository.timestamp(b.optString("published_at")),NewsRepository.timestamp(a.optString("published_at"))));
        return new ArrayList<>(items.subList(0,Math.min(items.size(),MAX_STORIES)));
    }
    static int position(Context c,int id,List<JSONObject> items){String anchor=NewsRepository.prefs(c).getString("widget_cursor_"+id,"");for(int i=0;i<items.size();i++)if(items.get(i).optString("id").equals(anchor))return i;return 0;}
    static int rowCount(String size,int height,boolean photos){if(size.equals("small"))return 1;return Math.max(1,Math.min(3,(height-(height<170?62:90))/(photos?(height<170?30:56):30)));}
    static void navigate(Context c,int id,int direction){
        AppWidgetManager manager=AppWidgetManager.getInstance(c);AppWidgetProviderInfo info=manager.getAppWidgetInfo(id);if(!owned(c,info)||kind(info).equals("large")||(direction!=-1&&direction!=1))return;
        List<JSONObject> items=selected(c,id);if(items.isEmpty())return;
        int height=manager.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,110);
        int step=rowCount(kind(info),height,config(c,id).optBoolean("showImages",true)),start=position(c,id,items);
        int next=direction>0?(start+step>=items.size()?0:start+step):(start-step<0?((items.size()-1)/step)*step:start-step);
        NewsRepository.prefs(c).edit().putString("widget_cursor_"+id,items.get(next).optString("id")).apply();update(c,manager,id);
    }
    static void refreshPhotos(Context c){
        AppWidgetManager manager=AppWidgetManager.getInstance(c);List<JSONObject> visible=new ArrayList<>(),upcoming=new ArrayList<>();
        for(Class<?> provider:new Class<?>[]{SmallWidget.class,MediumWidget.class,LargeWidget.class})for(int id:manager.getAppWidgetIds(new ComponentName(c,provider))){
            if(!config(c,id).optBoolean("showImages",true))continue;AppWidgetProviderInfo info=manager.getAppWidgetInfo(id);if(!owned(c,info))continue;
            List<JSONObject> items=selected(c,id);if(items.isEmpty())continue;String size=kind(info);int height=manager.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,size.equals("large")?250:110);
            int start=size.equals("large")?0:position(c,id,items),count=size.equals("large")?4:rowCount(size,height,true);
            for(int i=0;i<Math.min(count,items.size());i++)visible.add(items.get((start+i)%items.size()));
            if(size.equals("large"))upcoming.addAll(items);else for(int i=count;i<Math.min(count*2,items.size());i++)upcoming.add(items.get((start+i)%items.size()));
        }
        visible.addAll(upcoming);WidgetImageCache.preload(c,visible);updateAll(c);
    }

    public static RemoteViews createViews(Context c,int id,String size,Bundle options){
        JSONObject cfg=config(c,id),snapshot=NewsRepository.cached(c);String mode=cfg.optString("mode","latest"),category=cfg.optString("category","all");boolean light=cfg.optString("theme","dark").equals("light"),photos=cfg.optBoolean("showImages",true),collection=size.equals("large");
        List<JSONObject> items=selected(c,id);int height=options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,collection?250:110);boolean compact=height<170;
        int start=collection?0:position(c,id,items),rows=rowCount(size,height,photos);
        RemoteViews view=new RemoteViews(c.getPackageName(),R.layout.widget);int muted=Color.parseColor(light?"#737E8E":"#94A2B8"),gold=Color.parseColor(light?"#927035":"#D6B775");
        view.setInt(R.id.widget_root,"setBackgroundResource",light?R.drawable.widget_light:R.drawable.widget_dark);
        for(int label:new int[]{R.id.widget_label,R.id.widget_updated})view.setTextColor(label,muted);view.setTextColor(R.id.widget_brand,gold);view.setTextColor(R.id.widget_position,gold);view.removeAllViews(R.id.widget_rows);
        if(compact){float density=c.getResources().getDisplayMetrics().density;view.setViewPadding(R.id.widget_root,Math.round(12*density),Math.round(8*density),Math.round(12*density),Math.round(8*density));view.setViewVisibility(R.id.widget_label,View.GONE);}
        int catIndex=Arrays.asList(CATEGORY_IDS).indexOf(category);String label=mode.equals("saved")?MODE_LABELS[2]:mode.equals("important")?MODE_LABELS[1]:MODE_LABELS[0];view.setTextViewText(R.id.widget_label,label+(catIndex>0?" · "+CATEGORY_LABELS[catIndex]:""));
        view.setViewVisibility(R.id.widget_list,collection&&!items.isEmpty()?View.VISIBLE:View.GONE);view.setViewVisibility(R.id.widget_rows,collection&&!items.isEmpty()?View.GONE:View.VISIBLE);
        if(items.isEmpty()){
            RemoteViews row=new RemoteViews(c.getPackageName(),R.layout.widget_row);row.setTextViewText(R.id.story_title,mode.equals("saved")?"ข่าวที่คุณบันทึกไว้ จะแสดงตรงนี้":"เปิดแอปเพื่อรับข่าวล่าสุด");row.setTextColor(R.id.story_title,Color.parseColor(light?"#172238":"#F0F1F4"));row.setTextViewText(R.id.story_source,"แตะเพื่อเริ่มอ่านข่าว");row.setTextColor(R.id.story_source,muted);row.setOnClickPendingIntent(R.id.story_row,open(c,id,""));view.addView(R.id.widget_rows,row);
        }else if(collection){
            if(Build.VERSION.SDK_INT>=31){RemoteViews.RemoteCollectionItems.Builder builder=new RemoteViews.RemoteCollectionItems.Builder().setHasStableIds(true).setViewTypeCount(2);for(JSONObject item:items)builder.addItem(stableId(item),story(c,id,item,"large",height,true));view.setRemoteAdapter(R.id.widget_list,builder.build());}
            else legacyAdapter(c,id,view);
            Intent intent=new Intent(c,MainActivity.class).setData(Uri.parse("thaidaily://collection/"+id)).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_NEW_TASK);
            view.setPendingIntentTemplate(R.id.widget_list,PendingIntent.getActivity(c,60000+id,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_MUTABLE));
        }else for(int i=start;i<Math.min(start+rows,items.size());i++)view.addView(R.id.widget_rows,story(c,id,items.get(i),size,height,false));
        boolean pageable=!collection&&items.size()>rows;for(int control:new int[]{R.id.widget_previous,R.id.widget_next})view.setViewVisibility(control,pageable?View.VISIBLE:View.GONE);
        String counter=items.isEmpty()?"":collection?"เลื่อนดู · "+items.size()+" ข่าว":size.equals("small")?(start+1)+"/"+items.size():(start+1)+(Math.min(start+rows,items.size())>start+1?"–"+Math.min(start+rows,items.size()):"")+"/"+items.size();view.setTextViewText(R.id.widget_position,counter);
        view.setOnClickPendingIntent(R.id.widget_previous,navigation(c,id,-1));view.setOnClickPendingIntent(R.id.widget_next,navigation(c,id,1));
        String updated=snapshot.optString("updatedAt","");if(!updated.isEmpty()){boolean stale=System.currentTimeMillis()-NewsRepository.timestamp(updated)>30*60_000L;String time=new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date(NewsRepository.timestamp(updated)));view.setTextViewText(R.id.widget_updated,(stale?"ล่าช้า · ":compact?"":"อัปเดต ")+time);}
        view.setOnClickPendingIntent(R.id.widget_logo,open(c,id,""));view.setOnClickPendingIntent(R.id.widget_brand,open(c,id,""));
        Intent refresh=new Intent(c,WidgetRefreshReceiver.class).setAction("tdn.refresh."+id).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);view.setOnClickPendingIntent(R.id.widget_refresh,PendingIntent.getBroadcast(c,id,refresh,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE));
        Intent configure=new Intent(c,WidgetConfigActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);view.setOnClickPendingIntent(R.id.widget_settings,PendingIntent.getActivity(c,50000+id,configure,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE));return view;
    }
    @SuppressWarnings("deprecation")
    private static void legacyAdapter(Context c,int id,RemoteViews view){Intent adapter=new Intent(c,WidgetCollectionService.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id).setData(Uri.parse("thaidaily://adapter/"+id));view.setRemoteAdapter(R.id.widget_list,adapter);}
    static long stableId(JSONObject item){try{return Long.parseUnsignedLong(item.optString("id"),16);}catch(Exception e){return item.optString("id").hashCode();}}
    static RemoteViews story(Context c,int id,JSONObject item,String size,int height,boolean collection){
        JSONObject cfg=config(c,id);boolean light=cfg.optString("theme","dark").equals("light"),compact=height<170&&!collection,cover=size.equals("small")&&height>=140;
        Bitmap image=cfg.optBoolean("showImages",true)?(collection?WidgetImageCache.collectionImage(c,item.optString("image_url")):WidgetImageCache.get(c,item.optString("image_url"),cover)):null;
        int layout=image==null?R.layout.widget_row:cover?R.layout.widget_row_cover:compact?R.layout.widget_row_photo_compact:R.layout.widget_row_photo;RemoteViews row=new RemoteViews(c.getPackageName(),layout);
        if(image!=null){row.setImageViewBitmap(R.id.story_photo,image);row.setContentDescription(R.id.story_photo,"ภาพข่าวจาก "+item.optString("source"));}
        row.setTextViewText(R.id.story_title,item.optString("title_th",item.optString("title")));row.setTextColor(R.id.story_title,Color.parseColor(light?"#172238":"#F0F1F4"));row.setTextColor(R.id.story_source,Color.parseColor(light?"#737E8E":"#94A2B8"));row.setInt(R.id.story_title,"setMaxLines",size.equals("medium")&&compact?1:2);row.setTextViewTextSize(R.id.story_title,TypedValue.COMPLEX_UNIT_SP,12);
        row.setTextViewText(R.id.story_source,item.optString("source")+" · "+relative(item.optString("published_at")));if(compact)row.setViewVisibility(R.id.story_source,View.GONE);
        if(collection)row.setOnClickFillInIntent(R.id.story_row,new Intent().putExtra("article",item.optString("id")));else row.setOnClickPendingIntent(R.id.story_row,open(c,id,item.optString("id")));return row;
    }
    private static PendingIntent navigation(Context c,int id,int direction){Intent intent=new Intent(c,WidgetNavigationReceiver.class).setAction("tdn.widget.navigate").setData(Uri.parse("thaidaily://navigate/"+id+"/"+direction)).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id).putExtra("direction",direction);return PendingIntent.getBroadcast(c,id,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
    private static String relative(String date){long ms=Math.max(0,System.currentTimeMillis()-NewsRepository.timestamp(date));return ms<60_000?"เมื่อสักครู่":ms<3600_000?ms/60_000+" นาที":ms<86400_000?ms/3600_000+" ชม.":ms/86400_000+" วัน";}
    private static PendingIntent open(Context c,int request,String id){Intent intent=new Intent(c,MainActivity.class).setData(Uri.parse("thaidaily://widget/"+request+"/"+Uri.encode(id))).putExtra("article",id).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_NEW_TASK);return PendingIntent.getActivity(c,1000+request,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
    @Override public void onUpdate(Context c,AppWidgetManager manager,int[] ids){for(int id:ids)update(c,manager,id);NewsJobService.schedule(c);NewsJobService.refreshSoon(c);}
    @Override public void onAppWidgetOptionsChanged(Context c,AppWidgetManager manager,int id,Bundle options){update(c,manager,id);NewsRepository.IO.execute(()->refreshPhotos(c.getApplicationContext()));}
    @Override public void onDeleted(Context c,int[] ids){android.content.SharedPreferences.Editor edit=NewsRepository.prefs(c).edit();for(int id:ids){edit.remove("widget_"+id);edit.remove("widget_cursor_"+id);}edit.apply();}
}
