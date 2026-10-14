package com.basssg.thaidailynews;
import android.content.*;
/** Debug build only: posts the same notification outside the instrumentation process. */
public class NotificationTestReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent){NewsRepository.testNotification(context);}
}
