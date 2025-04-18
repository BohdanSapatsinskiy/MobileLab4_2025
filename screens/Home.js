import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import Constants from 'expo-constants';
import moment from 'moment-timezone';

const Home = () => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const APP_ID = Constants.expoConfig.extra.OneSignalAppId;
  const API_KEY = Constants.expoConfig.extra.OneSignalApiKey;

  const addTask = async () => {
    if (!taskName || !reminderDate || !reminderTime) {
      Alert.alert('Error', 'Please enter task name, date, and time');
      return;
    }

    try {
      const formattedDate = moment.tz(
        `${reminderDate} ${reminderTime}`,
        "YYYY-MM-DD HH:mm",
        "Europe/Kiev"
      ).toDate().toISOString();
      


      const notificationData = {
        app_id: APP_ID,
        headings: { en: taskName },
        contents: { en: taskDescription || '(No description)' },
        send_after: formattedDate,
        included_segments: ['All'],
      };

      const response = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${API_KEY}`,
        },
        body: JSON.stringify(notificationData),
      });

      const data = await response.json();

      if (data.errors) {
        console.error('OneSignal error:', data.errors);
        Alert.alert('Error', 'Failed to send notification.');
        return;
      }

      console.log('Notification sent successfully:', data);

      setTaskName('');
      setTaskDescription('');
      setReminderDate('');
      setReminderTime('');

    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', 'Failed to send notification.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Task Name"
        value={taskName}
        onChangeText={setTaskName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Task Description (optional)"
        value={taskDescription}
        onChangeText={setTaskDescription}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Enter Date (YYYY-MM-DD)"
        value={reminderDate}
        onChangeText={setReminderDate}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Enter Time (HH:MM)"
        value={reminderTime}
        onChangeText={setReminderTime}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button title="Add Task" onPress={addTask} />
    </View>
  );
};

export default Home;


