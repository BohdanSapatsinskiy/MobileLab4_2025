import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Button, Alert } from 'react-native';
import Constants from 'expo-constants';
import moment from 'moment-timezone';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const APP_ID = Constants.expoConfig.extra.OneSignalAppId;
  const API_KEY = Constants.expoConfig.extra.OneSignalApiKey;

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.onesignal.com/notifications?app_id=${APP_ID}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${API_KEY}`,
            'accept': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.notifications) {
        const now = moment();
        const scheduledOnly = data.notifications.filter(n =>
          n.successful === 0 &&
          (!n.completed_at || n.completed_at === null) &&
          n.send_after &&
          moment(n.send_after * 1000).isAfter(now)
        );

        setTasks(scheduledOnly);
      } else {
        console.error('❌ Помилка при отриманні задач:', data);
        Alert.alert('Помилка', 'Не вдалося отримати задачі.');
      }
    } catch (error) {
      console.error('❌ Помилка при отриманні задач:', error);
      Alert.alert('Помилка', 'Не вдалося отримати задачі.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const removeTask = async (notificationId) => {
    try {
      const response = await fetch(
        `https://api.onesignal.com/notifications/${notificationId}?app_id=${APP_ID}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${API_KEY}`,
          },
        }
      );

      const data = await response.json();
      if (data.errors) {
        console.error('❌ Помилка при видаленні сповіщення:', data.errors);
        Alert.alert('Помилка', data.errors[0] || 'Не вдалося видалити сповіщення.');
      } else {
        console.log('✅ Сповіщення видалено:', data);
        setTasks(prev => prev.filter(task => task.id !== notificationId));
      }
    } catch (error) {
      console.error('❌ Помилка при видаленні сповіщення:', error);
      Alert.alert('Помилка', 'Не вдалося видалити сповіщення.');
    }
  };

  const renderItem = ({ item }) => {
    const title = item.headings?.en || 'Без назви';
    const content = item.contents?.en || 'Без опису';

    const sendAfter = item.send_after
      ? moment(item.send_after * 1000).tz("Europe/Kiev").format("YYYY-MM-DD HH:mm")
      : 'Без дати';

    return (
      <View style={{ marginBottom: 20, padding: 10, borderWidth: 1, borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
        <Text>{content}</Text>
        <Text style={{ fontStyle: 'italic', color: 'gray' }}>Дата/час: {sendAfter}</Text>
        <Button title="Видалити" onPress={() => removeTask(item.id)} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title={loading ? "Оновлення..." : "Оновити"} onPress={fetchTasks} disabled={loading} />

      <View style={{ height: 20 }} />

      {tasks.length === 0 ? (
        <Text style={{ textAlign: 'center', fontSize: 16 }}>Запланованих задач немає</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default Tasks;

