package com.ledgermind.app

import android.Manifest
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import org.json.JSONArray
import org.json.JSONObject

/**
 * Capacitor plugin for reading SMS messages (transaction history)
 * Only reads SMS inbox, does not send or modify messages
 */
@CapacitorPlugin(
    name = "SMSReader",
    permissions = [
        Permission(strings = [Manifest.permission.READ_SMS], alias = "sms")
    ]
)
class SMSReaderPlugin : Plugin() {

    companion object {
        private const val TAG = "SMSReaderPlugin"
        private const val PERMISSION_DENIED = "SMS_PERMISSION_DENIED"
        private const val READ_ERROR = "SMS_READ_ERROR"
        private const val PREFS_NAME = "sms_reader_prefs"
        private const val PREF_SMS_PERMISSION_ASKED = "sms_permission_asked"
    }

    /**
     * Check if SMS read permission is granted
     */
    @PluginMethod
    fun checkPermission(call: PluginCall) {
        val granted = hasPermission()
        val requestedBefore = wasPermissionRequestedBefore()
        val canRequest = if (granted) {
            true
        } else {
            !requestedBefore || shouldShowRequestPermissionRationale()
        }

        val result = JSObject()
        result.put("granted", granted)
        result.put("canRequest", canRequest)
        call.resolve(result)
    }

    /**
     * Request SMS read permission from user
     */
    @PluginMethod
    fun requestPermission(call: PluginCall) {
        if (hasPermission()) {
            val result = JSObject()
            result.put("granted", true)
            call.resolve(result)
            return
        }

        markPermissionRequested()

        // Request permission and handle callback
        requestPermissionForAlias("sms", call, "permissionCallback")
    }

    /**
     * Permission callback handler
     */
    @PermissionCallback
    private fun permissionCallback(call: PluginCall) {
        val granted = hasPermission()
        val result = JSObject()
        result.put("granted", granted)
        call.resolve(result)
    }

    /**
     * Read SMS messages from inbox with filtering
     * @param startDate - Start timestamp in milliseconds
     * @param endDate - End timestamp in milliseconds
     * @param limit - Maximum number of messages to return
     */
    @PluginMethod
    fun readMessages(call: PluginCall) {
        if (!hasPermission()) {
            call.reject("Permission denied", PERMISSION_DENIED)
            return
        }

        try {
            val startDate = call.getLong("startDate") ?: 0L
            val endDate = call.getLong("endDate") ?: System.currentTimeMillis()
            val limit = call.getInt("limit") ?: 500

            val messages = fetchSMSMessages(startDate, endDate, limit)
            
            val result = JSObject()
            result.put("messages", messages)
            call.resolve(result)

        } catch (e: Exception) {
            call.reject("Failed to read SMS messages: ${e.message}", READ_ERROR, e)
        }
    }

    /**
     * Fetch SMS messages from Android ContentProvider
     */
    private fun fetchSMSMessages(startDate: Long, endDate: Long, limit: Int): JSONArray {
        val messages = JSONArray()
        val uri = Uri.parse("content://sms/inbox")
        
        // Columns to fetch
        val projection = arrayOf(
            "_id",
            "address",    // Sender phone number/ID
            "body",       // Message text
            "date",       // Timestamp in milliseconds
            "read"        // Read status
        )

        // Filter by date range
        val selection = "date >= ? AND date <= ?"
        val selectionArgs = arrayOf(startDate.toString(), endDate.toString())
        
        // Sort by date descending. Apply limit in code for better device compatibility.
        val sortOrder = "date DESC"

        var cursor: Cursor? = null
        try {
            cursor = context.contentResolver.query(
                uri,
                projection,
                selection,
                selectionArgs,
                sortOrder
            )

            cursor?.use {
                val idIndex = it.getColumnIndex("_id")
                val addressIndex = it.getColumnIndex("address")
                val bodyIndex = it.getColumnIndex("body")
                val dateIndex = it.getColumnIndex("date")
                val readIndex = it.getColumnIndex("read")

                var count = 0
                while (it.moveToNext() && count < limit) {
                    try {
                        val message = JSONObject()
                        message.put("id", it.getString(idIndex))
                        message.put("address", it.getString(addressIndex))
                        message.put("body", it.getString(bodyIndex))
                        message.put("date", it.getLong(dateIndex))
                        message.put("read", it.getInt(readIndex) == 1)
                        
                        messages.put(message)
                        count++
                    } catch (e: Exception) {
                        // Skip malformed messages
                        Logger.error(TAG, "Error parsing SMS message", e)
                    }
                }
            }
        } catch (e: Exception) {
            Logger.error(TAG, "Error reading SMS", e)
            throw e
        } finally {
            cursor?.close()
        }

        return messages
    }

    /**
     * Check if SMS read permission is granted
     */
    private fun hasPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.READ_SMS
        ) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Check if we should show permission rationale
     */
    private fun shouldShowRequestPermissionRationale(): Boolean {
        val activity = activity ?: return false
        return ActivityCompat.shouldShowRequestPermissionRationale(
            activity,
            Manifest.permission.READ_SMS
        )
    }

    private fun markPermissionRequested() {
        context.getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE)
            .edit()
            .putBoolean(PREF_SMS_PERMISSION_ASKED, true)
            .apply()
    }

    private fun wasPermissionRequestedBefore(): Boolean {
        return context.getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE)
            .getBoolean(PREF_SMS_PERMISSION_ASKED, false)
    }
}
