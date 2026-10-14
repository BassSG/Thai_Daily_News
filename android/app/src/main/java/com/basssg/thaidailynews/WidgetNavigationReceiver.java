package com.basssg.thaidailynews;
import android.appwidget.AppWidgetManager;
import android.content.*;
public class WidgetNavigationReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c,Intent intent){
        if(!"tdn.widget.navigate".equals(intent.getAction()))return;
        int id=intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID),direction=intent.getIntExtra("direction",0);
        if(!NewsWidgetProvider.owned(c,AppWidgetManager.getInstance(c).getAppWidgetInfo(id))||(direction!=-1&&direction!=1))return;
        NewsWidgetProvider.navigate(c,id,direction);
        NewsJobService.refreshWidgetPhotos(c);
    }
}
