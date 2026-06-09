import { notifications } from '@mantine/notifications';

interface NotificationOptions {
  title?: string;
  message: string;
}

export const addNotification = {
  success: ({ title = 'Успешно', message }: NotificationOptions) => {
    notifications.show({
      title,
      message,
      color: 'green',
      autoClose: 3000,
    });
  },

  error: ({ title = 'Ошибка', message }: NotificationOptions) => {
    notifications.show({
      title,
      message,
      color: 'red',
      autoClose: 5000,
    });
  },

  info: ({ title, message }: NotificationOptions) => {
    notifications.show({
      title,
      message,
      color: 'blue',
      autoClose: 3000,
    });
  },
};
