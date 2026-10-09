from flask import Blueprint, request, jsonify
from models import db, Analytics
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User

analytics_bp = Blueprint('analytics', __name__)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Allow OPTIONS requests without authentication
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200
        
        # For other methods, require JWT and admin role
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request()
        
        user_id = get_jwt_identity()
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        user = db.session.get(User, user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

# Public endpoint to get analytics
@analytics_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Get current analytics counts"""
    try:
        views = Analytics.query.filter_by(metric_name='views').first()
        clicks = Analytics.query.filter_by(metric_name='clicks').first()
        
        # Initialize if not exists
        if not views:
            views = Analytics(metric_name='views', count=0)
            db.session.add(views)
            db.session.commit()
        
        if not clicks:
            clicks = Analytics(metric_name='clicks', count=0)
            db.session.add(clicks)
            db.session.commit()
        
        return jsonify({
            'views': views.count,
            'clicks': clicks.count
        }), 200
    except Exception as e:
        print(f"Error getting analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Public endpoint to increment view count
@analytics_bp.route('/analytics/view', methods=['POST'])
def increment_view():
    """Increment view count"""
    try:
        views = Analytics.query.filter_by(metric_name='views').first()
        if not views:
            views = Analytics(metric_name='views', count=1)
            db.session.add(views)
        else:
            views.count += 1
        
        db.session.commit()
        return jsonify({'views': views.count}), 200
    except Exception as e:
        print(f"Error incrementing view: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Public endpoint to increment click count
@analytics_bp.route('/analytics/click', methods=['POST'])
def increment_click():
    """Increment click count"""
    try:
        clicks = Analytics.query.filter_by(metric_name='clicks').first()
        if not clicks:
            clicks = Analytics(metric_name='clicks', count=1)
            db.session.add(clicks)
        else:
            clicks.count += 1
        
        db.session.commit()
        return jsonify({'clicks': clicks.count}), 200
    except Exception as e:
        print(f"Error incrementing click: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Admin endpoint to update analytics
@analytics_bp.route('/admin/analytics', methods=['PUT', 'OPTIONS'])
@admin_required
def update_analytics():
    """Update analytics counts (admin only)"""
    try:
        data = request.get_json()
        
        if 'views' in data:
            views = Analytics.query.filter_by(metric_name='views').first()
            if not views:
                views = Analytics(metric_name='views', count=data['views'])
                db.session.add(views)
            else:
                views.count = data['views']
        
        if 'clicks' in data:
            clicks = Analytics.query.filter_by(metric_name='clicks').first()
            if not clicks:
                clicks = Analytics(metric_name='clicks', count=data['clicks'])
                db.session.add(clicks)
            else:
                clicks.count = data['clicks']
        
        db.session.commit()
        
        # Return updated values
        views = Analytics.query.filter_by(metric_name='views').first()
        clicks = Analytics.query.filter_by(metric_name='clicks').first()
        
        return jsonify({
            'success': True,
            'views': views.count if views else 0,
            'clicks': clicks.count if clicks else 0
        }), 200
    except Exception as e:
        print(f"Error updating analytics: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
