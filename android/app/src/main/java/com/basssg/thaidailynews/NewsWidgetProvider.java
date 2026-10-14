package com.basssg.thaidailynews;

import android.app.*;
import android.appwidget.*;
import android.content.*;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.TypedValue;
import android.widget.RemoteViews;
import org.json.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class NewsWidgetProvider extends AppWidgetProvider {
    public static final String[] CATEGORY_IDS={"all","politics","society","crime","economy","world","tech"};
    public static final String[] CATEGORY_LABELS={"ทุกหมวด","การเมือง","สังคม","อาชญากรรม","เศรษฐกิจ","ต่างประเทศ","เทคโนโลยี"};
    public static final String[] MODE_LABELS={"ข่าวล่าสุด","ข่าวสำคัญ","ข่าวที่บันทึกไว้"};
    static JSONObject config(Context c,int id){try{return new JSONObject(NewsRepository.prefs(c).getString("widget_"+id,"{}"));}catch(Exception e){return new JSONObject();}}
    public static void updateAll(Context c){AppWidgetManager manager=AppWidgetManager.getInstance(c);for(Class<?> provider:new Class<?>[]{SmallWidget.class,MediumWidget.class,LargeWidget.class})for(int id:manager.getAppWidgetIds(new ComponentName(c,provider)))update(c,manager,id);}
    private static String kind(AppWidgetProviderInfo info){return info.provider.getClassName().endsWith("SmallWidget")?"small":info.provider.getClassName().endsWith("LargeWidget")?"large":"medium";}
    static void update(Context c,AppWidgetManager manager,int id){AppWidgetProviderInfo info=manager.getAppWidgetInfo(id);if(info!=null)manager.updateAppWidget(id,createViews(c,id,kind(info),manager.getAppWidgetOptions(id)));}
    static List<JSONObject> selected(Context c,int id){
        JSONObject cfg=config(c,id);String mode=cfg.optString("mode","latest"),category=cfg.optString("category","all");
        JSONArray source=mode.equals("saved")?NewsRepository.bookmarks(c):NewsRepository.cached(c).optJSONArray("items");
        ArrayList<JSONObject> items=new ArrayList<>();if(source!=null)for(int i=0;i<source.length();i++){JSONObject it=source.optJSONObject(i);if(it!=null&&(category.equals("all")||category.equals(it.optString("category_id"))))items.add(it);}
        if(mode.equals("important"))items.sort((a,b)->Double.compare(b.optDouble("score"),a.optDouble("score")));
        else items.sort((a,b)->Long.compare(NewsRepository.timestamp(b.optString("published_at")),NewsRepository.timestamp(a.optString("published_at"))));
        return items;
    }
    private static int rowCount(String kind,int height,boolean photos){
        if(kind.equals("small"))return 1;
        if(kind.equals("medium"))return Math.max(1,Math.min(3,(height-(height<170?56:76))/(photos?(height<170?34:56):24)));
        return Math.max(1,Math.min(6,(height-78)/56));
    }
    static void refreshPhotos(Context c){
        AppWidgetManager manager=AppWidgetManager.getInstance(c);List<JSONObject> candidates=new ArrayList<>();
        for(Class<?> provider:new Class<?>[]{SmallWidget.class,MediumWidget.class,LargeWidget.class})for(int id:manager.getAppWidgetIds(new ComponentName(c,provider))){
            if(!config(c,id).optBoolean("showImages",true))continue;
            AppWidgetProviderInfo info=manager.getAppWidgetInfo(id);if(info==null)continue;
            String size=kind(info);int height=manager.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,size.equals("large")?250:110);
            List<JSONObject> items=selected(c,id);candidates.addAll(items.subList(0,Math.min(items.size(),rowCount(size,height,true))));
        }
        WidgetImageCache.preload(c,candidates);updateAll(c);
    }
    public static RemoteViews createViews(Context c,int id,String kind,Bundle options){
        JSONObject cfg=config(c,id),snapshot=NewsRepository.cached(c);String mode=cfg.optString("mode","latest"),category=cfg.optString("category","all");boolean light=cfg.optString("theme","dark").equals("light"),photos=cfg.optBoolean("showImages",true);
        List<JSONObject> items=selected(c,id);
        int height=options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,kind.equals("large")?250:110);
        boolean compact=height<170;
        int rows=rowCount(kind,height,photos);
        RemoteViews view=new RemoteViews(c.getPackageName(),R.layout.widget);
        view.setInt(R.id.widget_root,"setBackgroundResource",light?R.drawable.widget_light:R.drawable.widget_dark);
        int text=Color.parseColor(light?"#172238":"#F0F1F4"),muted=Color.parseColor(light?"#737E8E":"#94A2B8");
        view.setTextColor(R.id.widget_label,muted);view.setTextColor(R.id.widget_updated,muted);view.setTextColor(R.id.widget_brand,Color.parseColor(light?"#927035":"#D6B775"));view.removeAllViews(R.id.widget_rows);
        if(compact){float density=c.getResources().getDisplayMetrics().density;view.setViewPadding(R.id.widget_root,Math.round(14*density),Math.round(10*density),Math.round(14*density),Math.round(10*density));view.setViewVisibility(R.id.widget_label,android.view.View.GONE);}
        int catIndex=Arrays.asList(CATEGORY_IDS).indexOf(category);String label=mode.equals("saved")?MODE_LABELS[2]:mode.equals("important")?MODE_LABELS[1]:MODE_LABELS[0];
        view.setTextViewText(R.id.widget_label,label+(catIndex>0?" · "+CATEGORY_LABELS[catIndex]:""));
        if(items.isEmpty()){
            RemoteViews row=new RemoteViews(c.getPackageName(),R.layout.widget_row);row.setTextViewText(R.id.story_title,mode.equals("saved")?"ข่าวที่คุณบันทึกไว้ จะแสดงตรงนี้":"เปิดแอปเพื่อรับข่าวล่าสุด");row.setTextColor(R.id.story_title,text);row.setTextViewText(R.id.story_source,mode.equals("saved")?"แตะเพื่อเลือกข่าวที่สนใจ":"แตะเพื่อเริ่มอ่านข่าว");row.setTextColor(R.id.story_source,muted);row.setOnClickPendingIntent(R.id.story_row,open(c,id,""));view.addView(R.id.widget_rows,row);
        }else for(int i=0;i<Math.min(rows,items.size());i++){
            JSONObject it=items.get(i);boolean cover=kind.equals("small")&&height>=140;
            Bitmap image=photos?WidgetImageCache.get(c,it.optString("image_url"),cover):null;
            int layout=image==null?R.layout.widget_row:cover?R.layout.widget_row_cover:compact?R.layout.widget_row_photo_compact:R.layout.widget_row_photo;
            RemoteViews row=new RemoteViews(c.getPackageName(),layout);
            if(image!=null){row.setImageViewBitmap(R.id.story_photo,image);row.setContentDescription(R.id.story_photo,"ภาพข่าวจาก "+it.optString("source"));}
            row.setTextViewText(R.id.story_title,it.optString("title_th",it.optString("title")));row.setTextColor(R.id.story_title,text);row.setTextColor(R.id.story_source,muted);
            row.setInt(R.id.story_title,"setMaxLines",kind.equals("medium")&&compact?1:2);
            row.setTextViewTextSize(R.id.story_title,TypedValue.COMPLEX_UNIT_SP,image!=null?12:kind.equals("medium")?12:13);
            row.setTextViewText(R.id.story_source,it.optString("source")+" · "+relative(it.optString("published_at")));
            if(image==null){float density=c.getResources().getDisplayMetrics().density;row.setViewPadding(R.id.story_row,0,Math.round(4*density),0,Math.round(4*density));}
            if(compact&&(kind.equals("medium")||image!=null))row.setViewVisibility(R.id.story_source,android.view.View.GONE);
            row.setOnClickPendingIntent(R.id.story_row,open(c,id*10+i,it.optString("id")));view.addView(R.id.widget_rows,row);
        }
        String updated=snapshot.optString("updatedAt","");
        if(!updated.isEmpty()){boolean stale=System.currentTimeMillis()-NewsRepository.timestamp(updated)>30*60_000L;view.setTextViewText(R.id.widget_updated,(stale?"ข้อมูลอาจล่าช้า · ":"อัปเดต ")+new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date(NewsRepository.timestamp(updated))));}
        view.setOnClickPendingIntent(R.id.widget_logo,open(c,id,""));view.setOnClickPendingIntent(R.id.widget_brand,open(c,id,""));
        Intent refresh=new Intent(c,WidgetRefreshReceiver.class).setAction("tdn.refresh."+id);view.setOnClickPendingIntent(R.id.widget_refresh,PendingIntent.getBroadcast(c,id,refresh,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE));
        Intent configure=new Intent(c,WidgetConfigActivity.class).putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);view.setOnClickPendingIntent(R.id.widget_settings,PendingIntent.getActivity(c,50000+id,configure,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE));return view;
    }
    private static String relative(String date){long ms=Math.max(0,System.currentTimeMillis()-NewsRepository.timestamp(date));return ms<60_000?"เมื่อสักครู่":ms<3600_000?ms/60_000+" นาที":ms<86400_000?ms/3600_000+" ชม.":ms/86400_000+" วัน";}
    private static PendingIntent open(Context c,int request,String id){Intent intent=new Intent(c,MainActivity.class).putExtra("article",id).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_NEW_TASK);return PendingIntent.getActivity(c,1000+request,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
    @Override public void onUpdate(Context c,AppWidgetManager manager,int[] ids){for(int id:ids)update(c,manager,id);NewsJobService.schedule(c);NewsJobService.refreshSoon(c);}
    @Override public void onAppWidgetOptionsChanged(Context c,AppWidgetManager manager,int id,Bundle options){update(c,manager,id);NewsRepository.IO.execute(()->refreshPhotos(c.getApplicationContext()));}
    @Override public void onDeleted(Context c,int[] ids){android.content.SharedPreferences.Editor edit=NewsRepository.prefs(c).edit();for(int id:ids)edit.remove("widget_"+id);edit.apply();}
}
