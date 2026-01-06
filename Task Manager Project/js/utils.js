// Utility functions

class Utils {
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static validateTask(task) {
        const errors = [];
        
        if (!task.text || task.text.trim().length === 0) {
            errors.push('Task text is required');
        }
        
        if (task.text && task.text.length > 500) {
            errors.push('Task text is too long (max 500 characters)');
        }
        
        if (!['low', 'medium', 'high'].includes(task.priority)) {
            errors.push('Invalid priority level');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Add show class
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    static createPriorityBadge(priority) {
        const badges = {
            high: '<span class="priority-badge priority-high">High</span>',
            medium: '<span class="priority-badge priority-medium">Medium</span>',
            low: '<span class="priority-badge priority-low">Low</span>'
        };
        return badges[priority] || badges.medium;
    }
}