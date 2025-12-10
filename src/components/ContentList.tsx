/**
 * Content List Component
 * Displays and manages content items
 */

import React, { useState } from 'react';
import { useContentList } from '../controllers/content.controller';

interface ContentFilterProps {
  options: any;
  onApplyFilters: (filters: any) => void;
}

const ContentFilter: React.FC<ContentFilterProps> = ({ options, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    category: options.category || '',
    status: options.status || '',
    sortBy: options.sortBy || 'createdAt',
    sortDir: options.sortDir || 'desc',
    search: options.search || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      category: '',
      status: '',
      sortBy: 'createdAt',
      sortDir: 'desc',
      search: ''
    };
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="content-filter">
      <div className="filter-row">
        <div className="filter-field">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search content..."
          />
        </div>
        
        <div className="filter-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
          >
            <option value="">All Categories</option>
            <option value="news">News</option>
            <option value="article">Articles</option>
            <option value="event">Events</option>
            <option value="page">Pages</option>
          </select>
        </div>
        
        <div className="filter-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      
      <div className="filter-row">
        <div className="filter-field">
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="title">Title</option>
            <option value="views">Views</option>
          </select>
        </div>
        
        <div className="filter-field">
          <label htmlFor="sortDir">Sort Direction</label>
          <select
            id="sortDir"
            name="sortDir"
            value={filters.sortDir}
            onChange={handleChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        
        <div className="filter-actions">
          <button type="submit" className="filter-apply-btn">Apply Filters</button>
          <button 
            type="button" 
            className="filter-reset-btn"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
};

interface ContentStatusBadgeProps {
  status: string;
}

const ContentStatusBadge: React.FC<ContentStatusBadgeProps> = ({ status }) => {
  const statusClass = `status-badge ${status.toLowerCase()}`;
  
  return <span className={statusClass}>{status}</span>;
};

interface ContentItemProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string, isPublished: boolean) => void;
}

const ContentItem: React.FC<ContentItemProps> = ({
  id,
  title,
  excerpt,
  category,
  status,
  publishedAt,
  createdAt,
  updatedAt,
  onView,
  onEdit,
  onDelete,
  onPublish
}) => {
  const isPublished = status === 'published';
  
  return (
    <div className="content-item">
      <div className="content-item-header">
        <h3 className="content-item-title">{title}</h3>
        <div className="content-item-meta">
          <span className="content-category">{category}</span>
          <ContentStatusBadge status={status} />
        </div>
      </div>
      
      <p className="content-item-excerpt">{excerpt}</p>
      
      <div className="content-item-footer">
        <div className="content-item-dates">
          <span className="content-created-date">
            Created: {new Date(createdAt).toLocaleDateString()}
          </span>
          {publishedAt && (
            <span className="content-published-date">
              Published: {new Date(publishedAt).toLocaleDateString()}
            </span>
          )}
          <span className="content-updated-date">
            Updated: {new Date(updatedAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="content-item-actions">
          <button 
            className="view-btn"
            onClick={() => onView(id)}
            aria-label="View content"
          >
            View
          </button>
          <button 
            className="edit-btn"
            onClick={() => onEdit(id)}
            aria-label="Edit content"
          >
            Edit
          </button>
          <button 
            className="publish-btn"
            onClick={() => onPublish(id, !isPublished)}
            aria-label={isPublished ? "Unpublish content" : "Publish content"}
          >
            {isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button 
            className="delete-btn"
            onClick={() => onDelete(id)}
            aria-label="Delete content"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentList: React.FC = () => {
  const {
    content,
    loading,
    error,
    pagination,
    options,
    fetchContent,
    applyFilters
  } = useContentList();

  // Placeholder for handling content actions
  const handleViewContent = (id: string) => {
    console.log(`View content with ID: ${id}`);
    // Navigate to content detail view
  };

  const handleEditContent = (id: string) => {
    console.log(`Edit content with ID: ${id}`);
    // Navigate to content edit form
  };

  const handleDeleteContent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this content item?')) {
      console.log(`Delete content with ID: ${id}`);
      // Call the delete method from the controller
    }
  };

  const handlePublishToggle = (id: string, isPublished: boolean) => {
    console.log(`${isPublished ? 'Publish' : 'Unpublish'} content with ID: ${id}`);
    // Call the publish toggle method from the controller
  };

  if (loading && content.length === 0) {
    return <div className="loading-indicator">Loading content...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="content-manager">
      <div className="content-header">
        <h2>Content Management</h2>
        <button className="create-content-btn">Create New Content</button>
      </div>
      
      <ContentFilter 
        options={options} 
        onApplyFilters={applyFilters} 
      />
      
      {content.length === 0 ? (
        <div className="empty-state">
          <p>No content items found.</p>
          <p>Try adjusting your filters or create new content.</p>
        </div>
      ) : (
        <div className="content-list">
          {content.map((item) => (
            <ContentItem
              key={item.id}
              id={item.id}
              title={item.title}
              excerpt={item.excerpt}
              category={item.category}
              status={item.status}
              publishedAt={item.publishedAt}
              createdAt={item.createdAt}
              updatedAt={item.updatedAt}
              onView={handleViewContent}
              onEdit={handleEditContent}
              onDelete={handleDeleteContent}
              onPublish={handlePublishToggle}
            />
          ))}
        </div>
      )}
      
      {pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button
            className="pagination-btn prev"
            disabled={pagination.page === 1}
            onClick={() => fetchContent({ page: pagination.page - 1 })}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            className="pagination-btn next"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchContent({ page: pagination.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentList;
