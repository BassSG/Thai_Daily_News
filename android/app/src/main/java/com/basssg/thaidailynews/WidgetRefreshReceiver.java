package com.basssg.thaidailynews;
import android.content.*;
public class WidgetRefreshReceiver extends BroadcastReceiver { @Override public void onReceive(Context c,Intent i){NewsJobService.refreshSoon(c);} }
