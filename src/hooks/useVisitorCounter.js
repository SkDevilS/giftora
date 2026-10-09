import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useVisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);

  // Fetch initial analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        setVisitorCount(response.data.views);
        setClickCount(response.data.clicks);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setVisitorCount(0);
        setClickCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Increment view count on mount (page load)
  useEffect(() => {
    const incrementView = async () => {
      try {
        const response = await api.post('/analytics/view');
        setVisitorCount(response.data.views);
        setRecentlyUpdated(true);
        setTimeout(() => setRecentlyUpdated(false), 3000);
      } catch (error) {
        console.error('Error incrementing view:', error);
      }
    };

    // Only increment if not loading
    if (!isLoading) {
      incrementView();
    }
  }, [isLoading]);

  // Track clicks on any element in the page
  useEffect(() => {
    const handleClick = async () => {
      try {
        const response = await api.post('/analytics/click');
        setClickCount(response.data.clicks);
      } catch (error) {
        console.error('Error incrementing click:', error);
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Simulate real-time updates by polling the server
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get('/analytics');
        setVisitorCount(response.data.views);
        setClickCount(response.data.clicks);
      } catch (error) {
        console.error('Error polling analytics:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return { visitorCount, clickCount, isLoading, recentlyUpdated };
};
