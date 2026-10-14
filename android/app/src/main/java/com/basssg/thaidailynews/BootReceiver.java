package com.basssg.thaidailynews;
import android.content.*;
public class BootReceiver extends BroadcastReceiver { @Override public void onReceive(Context c,Intent i){NewsJobService.schedule(c);NewsJobService.refreshSoon(c);} }
