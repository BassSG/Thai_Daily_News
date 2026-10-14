package com.basssg.thaidailynews;
import android.app.*;
import android.appwidget.*;
import android.content.*;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.util.Arrays;

public class WidgetConfigActivity extends Activity {
    private int widgetId;
    private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}
    @Override public void onCreate(Bundle state){
        super.onCreate(state);setResult(RESULT_CANCELED);
        widgetId=getIntent().getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
        AppWidgetProviderInfo info=AppWidgetManager.getInstance(this).getAppWidgetInfo(widgetId);
        if(widgetId==AppWidgetManager.INVALID_APPWIDGET_ID||info==null||!info.provider.getPackageName().equals(getPackageName())){finish();return;}
        JSONObject cfg=NewsWidgetProvider.config(this,widgetId);
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);scroll.setBackgroundColor(Color.parseColor("#080F1C"));LinearLayout content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);content.setPadding(dp(28),dp(52),dp(28),dp(40));scroll.addView(content);setContentView(scroll);
        ImageView logo=new ImageView(this);logo.setImageResource(R.drawable.logo);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(dp(74),dp(74));lp.bottomMargin=dp(24);content.addView(logo,lp);
        label(content,"MAKE IT YOURS",11,"#D6B775",true);label(content,"วิดเจ็ตของคุณ",29,"#EDF0F6",true);label(content,"เลือกข่าวที่อยากเห็น ให้พื้นที่บนหน้าจอเป็นของคุณ",13,"#94A2B8",false);
        label(content,NewsWidgetProvider.kind(info).equals("large")?"เลื่อนขึ้น–ลงดูข่าวได้สูงสุด 20 เรื่อง แตะข่าวเพื่อเปิดอ่าน":NewsWidgetProvider.kind(info).equals("small")?"แตะลูกศรเพื่อสลับข่าวทีละเรื่อง พร้อมเลขลำดับข่าว":"แตะลูกศรเพื่อเปลี่ยนชุดข่าว จำนวนเรื่องปรับตามขนาดวิดเจ็ต",12,"#D6B775",false);
        label(content,"แสดงอะไรบนวิดเจ็ต",14,"#EDF0F6",true);
        Spinner mode=spinner(content,NewsWidgetProvider.MODE_LABELS);String[] modes={"latest","important","saved"};mode.setSelection(Math.max(0,Arrays.asList(modes).indexOf(cfg.optString("mode","latest"))));
        label(content,"เลือกหมวดข่าว",14,"#EDF0F6",true);Spinner category=spinner(content,NewsWidgetProvider.CATEGORY_LABELS);category.setSelection(Math.max(0,Arrays.asList(NewsWidgetProvider.CATEGORY_IDS).indexOf(cfg.optString("category","all"))));
        label(content,"บรรยากาศของวิดเจ็ต",14,"#EDF0F6",true);Spinner theme=spinner(content,new String[]{"Midnight · น้ำเงินเข้ม","Ivory · สว่างอบอุ่น"});theme.setSelection(cfg.optString("theme","dark").equals("light")?1:0);
        Switch photos=new Switch(this);photos.setText("แสดงภาพข่าว");photos.setTextColor(Color.parseColor("#EDF0F6"));photos.setTextSize(14);photos.setChecked(cfg.optBoolean("showImages",true));LinearLayout.LayoutParams photoParams=new LinearLayout.LayoutParams(-1,dp(52));photoParams.topMargin=dp(22);content.addView(photos,photoParams);
        label(content,"ใช้ภาพจริงจากสำนักข่าว เก็บภาพย่อในเครื่องเพื่ออ่านได้เร็ว หากข่าวไม่มีภาพจะแสดงหัวข้อข่าว เปิด–ปิดภาพแยกกันได้สำหรับแต่ละวิดเจ็ต",12,"#94A2B8",false);
        label(content,"กดค้างที่วิดเจ็ตบนหน้าจอหลักเพื่อปรับขนาด แตะรูปเฟืองเพื่อกลับมาเปลี่ยนการแสดงผลได้ทุกเมื่อ",12,"#94A2B8",false);
        Button done=new Button(this);done.setText("ใช้วิดเจ็ตนี้");done.setTextColor(Color.parseColor("#101A29"));done.setTextSize(15);done.setAllCaps(false);GradientDrawable bg=new GradientDrawable();bg.setColor(Color.parseColor("#D6B775"));bg.setCornerRadius(dp(14));done.setBackground(bg);LinearLayout.LayoutParams buttonParams=new LinearLayout.LayoutParams(-1,dp(54));buttonParams.topMargin=dp(28);content.addView(done,buttonParams);
        done.setOnClickListener(v->{try{JSONObject result=new JSONObject().put("mode",modes[mode.getSelectedItemPosition()]).put("category",NewsWidgetProvider.CATEGORY_IDS[category.getSelectedItemPosition()]).put("theme",theme.getSelectedItemPosition()==1?"light":"dark").put("showImages",photos.isChecked());NewsRepository.prefs(this).edit().putString("widget_"+widgetId,result.toString()).remove("widget_cursor_"+widgetId).apply();NewsWidgetProvider.update(this,AppWidgetManager.getInstance(this),widgetId);NewsJobService.refreshWidgetPhotos(this);NewsJobService.schedule(this);setResult(RESULT_OK,new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,widgetId));finish();}catch(JSONException ignored){}});
    }
    private void label(LinearLayout parent,String text,int size,String color,boolean bold){TextView view=new TextView(this);view.setText(text);view.setTextSize(size);view.setTextColor(Color.parseColor(color));view.setLineSpacing(dp(3),1);if(bold)view.setTypeface(Typeface.DEFAULT,Typeface.BOLD);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,-2);lp.topMargin=dp(size==14?26:9);parent.addView(view,lp);}
    private Spinner spinner(LinearLayout parent,String[] items){Spinner spinner=new Spinner(this);ArrayAdapter<String> adapter=new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,items);spinner.setAdapter(adapter);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,dp(54));lp.topMargin=dp(10);parent.addView(spinner,lp);return spinner;}
}
