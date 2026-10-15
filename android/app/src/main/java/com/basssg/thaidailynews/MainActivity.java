package com.basssg.thaidailynews;

import android.app.*;
import android.appwidget.AppWidgetManager;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.*;
import android.webkit.*;
import android.view.*;
import org.json.*;
import java.io.*;
import java.util.Map;

public class MainActivity extends Activity {
    private WebView web;
    private String initialArticle="";
    private final Handler main=new Handler(Looper.getMainLooper());
    @Override public void onCreate(Bundle state){
        super.onCreate(state);initialArticle=getIntent().getStringExtra("article");
        web=new WebView(this);web.setBackgroundColor(Color.rgb(8,15,28));
        android.widget.FrameLayout container=new android.widget.FrameLayout(this);container.setBackgroundColor(Color.rgb(8,15,28));container.addView(web,new android.widget.FrameLayout.LayoutParams(-1,-1));setContentView(container);
        // WebView content ignores its own view padding: apply system-bar insets to its parent.
        container.setOnApplyWindowInsetsListener((v,insets)->{if(Build.VERSION.SDK_INT>=30){android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars());v.setPadding(bars.left,bars.top,bars.right,bars.bottom);return WindowInsets.CONSUMED;}v.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets.consumeSystemWindowInsets();});
        WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);settings.setMediaPlaybackRequiresUserGesture(true);settings.setSupportMultipleWindows(false);
        web.addJavascriptInterface(new NativeBridge(),"NativeNews");web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient(){
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();if(!"appassets.androidplatform.net".equals(uri.getHost()))return null;
                String p=uri.getPath();if(p==null||p.equals("/"))p="/index.html";
                if(p.contains(".."))return new WebResourceResponse("text/plain","UTF-8",403,"Forbidden",java.util.Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));
                String mime=p.endsWith(".js")?"text/javascript":p.endsWith(".css")?"text/css":p.endsWith(".png")?"image/png":p.endsWith(".webmanifest")?"application/manifest+json":"text/html";
                try{return new WebResourceResponse(mime,"UTF-8",200,"OK",java.util.Collections.singletonMap("Cache-Control","no-cache"),getAssets().open("web"+p));}catch(IOException e){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",java.util.Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){if("appassets.androidplatform.net".equals(request.getUrl().getHost()))return false;if(!request.isForMainFrame())return false;openExternal(request.getUrl().toString());return true;}
        });
        web.loadUrl("https://appassets.androidplatform.net/");NewsRepository.createChannel(this);NewsJobService.schedule(this);
        if(Build.VERSION.SDK_INT>=33)getOnBackInvokedDispatcher().registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,this::handleBack);
    }
    @Override protected void onNewIntent(Intent intent){super.onNewIntent(intent);setIntent(intent);initialArticle=intent.getStringExtra("article");if(initialArticle!=null&&!initialArticle.isEmpty()){try{emit("tdn-open-article",new JSONObject().put("id",initialArticle));}catch(JSONException ignored){}}}
    @Override protected void onResume(){super.onResume();if(System.currentTimeMillis()-NewsRepository.prefs(this).getLong("last_success",0)>5*60_000L)NewsJobService.refreshSoon(this);}
    void emit(String event,JSONObject detail){main.post(()->{if(web!=null)web.evaluateJavascript("window.dispatchEvent(new CustomEvent("+JSONObject.quote(event)+",{detail:"+detail+"}));",null);});}
    void tell(String text){try{emit("tdn-toast",new JSONObject().put("message",text));}catch(JSONException ignored){}}
    private void handleBack(){web.evaluateJavascript("window.TDN_BACK ? window.TDN_BACK() : false",result->{if(!"true".equals(result))finish();});}
    // Android 13+ uses the OnBackInvokedCallback registered above; this is the API 26–32 fallback.
    @android.annotation.SuppressLint("GestureBackNavigation")
    @Override public void onBackPressed(){handleBack();}
    @Override protected void onDestroy(){if(web!=null){web.removeJavascriptInterface("NativeNews");web.destroy();web=null;}super.onDestroy();}
    private void openExternal(String url){try{Uri uri=Uri.parse(url);if(!"https".equals(uri.getScheme())&&!"http".equals(uri.getScheme()))return;startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception e){tell("ยังเปิดลิงก์ไม่ได้");}}
    @Override public void onRequestPermissionsResult(int requestCode,String[] permissions,int[] results){super.onRequestPermissionsResult(requestCode,permissions,results);if(requestCode==41){boolean granted=results.length>0&&results[0]==PackageManager.PERMISSION_GRANTED;try{emit("tdn-notification-permission",new JSONObject().put("granted",granted));}catch(JSONException ignored){}}}
    public class NativeBridge {
        @JavascriptInterface public String getCachedSnapshot(){return NewsRepository.cached(MainActivity.this).toString();}
        @JavascriptInterface public String getSettings(){return NewsRepository.settings(MainActivity.this).toString();}
        @JavascriptInterface public String getInitialArticle(){String id=initialArticle;initialArticle="";return id==null?"":id;}
        @JavascriptInterface public void request(String id,String body){if(id.length()>100||body.length()>12000)return;NewsRepository.IO.execute(()->{JSONObject result;try{JSONObject payload=new JSONObject(body);String action=payload.optString("action");if(action.equals("snapshot")){result=NewsRepository.refresh(MainActivity.this,false,false);NewsRepository.IO.execute(()->NewsWidgetProvider.refreshPhotos(getApplicationContext()));}else if(action.equals("summary")){String article=payload.optString("id");if(!article.matches("[a-f0-9]{16}"))throw new Exception("Invalid id");result=NewsRepository.request(NewsRepository.API,payload);}else throw new Exception("Unsupported action");}catch(Exception e){result=new JSONObject();try{result.put("ok",false).put("error","ยังเชื่อมต่อไม่ได้ ข่าวที่บันทึกไว้ยังอ่านได้");}catch(JSONException ignored){}}try{emit("tdn-native-result",new JSONObject().put("requestId",id).put("result",result));}catch(JSONException ignored){}});}
        @JavascriptInterface public void saveBookmarks(String json){if(json.length()>1_000_000)return;try{new JSONArray(json);NewsRepository.prefs(MainActivity.this).edit().putString("bookmarks",json).apply();NewsRepository.IO.execute(()->{NewsWidgetProvider.updateAll(MainActivity.this);NewsWidgetProvider.refreshPhotos(getApplicationContext());});}catch(JSONException ignored){}}
        @JavascriptInterface public void setSettings(String json){if(json.length()>5000)return;try{JSONObject obj=new JSONObject(json);NewsRepository.prefs(MainActivity.this).edit().putString("settings",obj.toString()).apply();NewsJobService.schedule(MainActivity.this);}catch(JSONException ignored){}}
        @JavascriptInterface public void enableNotifications(){main.post(()->{if(Build.VERSION.SDK_INT>=33&&!NewsRepository.permission(MainActivity.this))requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS},41);else try{emit("tdn-notification-permission",new JSONObject().put("granted",true));}catch(JSONException ignored){}});}
        @JavascriptInterface public void testNotification(){main.post(()->{if(!NewsRepository.permission(MainActivity.this)){tell("กรุณาเปิดการแจ้งเตือนก่อน");return;}NewsRepository.testNotification(MainActivity.this);tell("ส่งการแจ้งเตือนทดสอบแล้ว");});}
        @JavascriptInterface public void openExternal(String url){main.post(()->MainActivity.this.openExternal(url));}
        @JavascriptInterface public void share(String title,String url){if(!url.startsWith("https://")&&!url.startsWith("http://"))return;main.post(()->{Intent intent=new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT,title+"\n"+url);startActivity(Intent.createChooser(intent,"แชร์ข่าว"));});}
        @JavascriptInterface public void setTheme(String theme){main.post(()->{boolean light="light".equals(theme);int color=Color.parseColor(light?"#F8F6F1":"#080F1C");getWindow().setStatusBarColor(color);getWindow().setNavigationBarColor(color);web.setBackgroundColor(color);((android.view.View)web.getParent()).setBackgroundColor(color);if(Build.VERSION.SDK_INT>=30)getWindow().getInsetsController().setSystemBarsAppearance(light?WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS|WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS:0,WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS|WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);});}
        @JavascriptInterface public void pinWidget(String kind){main.post(()->{AppWidgetManager manager=AppWidgetManager.getInstance(MainActivity.this);if(!manager.isRequestPinAppWidgetSupported()){tell("กดค้างที่หน้าจอหลัก เลือกวิดเจ็ต แล้วเลือก Thai Daily News");return;}Class<?> provider="small".equals(kind)?SmallWidget.class:"large".equals(kind)?LargeWidget.class:MediumWidget.class;Intent configure=new Intent(MainActivity.this,WidgetConfigActivity.class).putExtra("from_pin",true);PendingIntent callback=PendingIntent.getActivity(MainActivity.this,kind.hashCode(),configure,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_MUTABLE);manager.requestPinAppWidget(new ComponentName(MainActivity.this,provider),null,callback);});}
    }
}
