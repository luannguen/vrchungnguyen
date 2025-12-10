/**
 * Notification Component
 * Displays user notifications and provides interaction for marking as read/deleting
 */

import React from 'react';
import { useNotifications } from '../controllers/notification.controller';

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  message,
  createdAt,
  readAt,
  onMarkAsRead,
  onDelete
}) => {
  const isRead = Boolean(readAt);
  
  return (
    <div className={`notification-item ${!isRead ? 'unread' : ''}`}>
      <div className="notification-header">
        <h3 className="notification-title">{title}</h3>
        <div className="notification-actions">
          {!isRead && (
            <button 
              className="mark-read-btn"
              onClick={() => onMarkAsRead(id)}
              aria-label="Mark as read"
            >
              <span className="sr-only">Mark as read</span>
              <i className="icon-check" />
            </button>
          )}
          <button 
            className="delete-btn"
            onClick={() => onDelete(id)}
            aria-label="Delete notification"
          >
            <span className="sr-only">Delete</span>
            <i className="icon-trash" />
          </button>
        </div>
      </div>
      
      <p className="notification-message">{message}</p>
      
      <div className="notification-footer">
        <span className="notification-date">
          {new Date(createdAt).toLocaleDateString()} • {new Date(createdAt).toLocaleTimeString()}
        </span>
        {isRead && (
          <span className="notification-read-status">Read</span>
        )}
      </div>
    </div>
  );
};

const NotificationList: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  if (loading && notifications.length === 0) {
    return <div className="loading-indicator">Loading notifications...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="empty-state">You have no notifications.</div>;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2 className="notifications-title">
          Notifications
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h2>
        
        {unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="notifications-list">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            title={notification.title}
            message={notification.message}
            createdAt={notification.createdAt}
            readAt={notification.readAt}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        ))}
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn prev"
            disabled={pagination.page === 1}
            onClick={() => fetchNotifications(pagination.page - 1, pagination.limit)}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            className="pagination-btn next"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchNotifications(pagination.page + 1, pagination.limit)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
