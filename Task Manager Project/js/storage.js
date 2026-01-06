// localStorage operations

class StorageManager {
    static STORAGE_KEY = 'taskManager_tasks';
    static SETTINGS_KEY = 'taskManager_settings';

    // Task Storage Methods
    static saveTasks(tasks) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            Utils.showNotification('Failed to save tasks to localStorage', 'error');
            return false;
        }
    }

    static loadTasks() {
        try {
            const tasks = localStorage.getItem(this.STORAGE_KEY);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            Utils.showNotification('Failed to load tasks from localStorage', 'error');
            return [];
        }
    }

    static clearTasks() {
        localStorage.removeItem(this.STORAGE_KEY);
        Utils.showNotification('All tasks cleared', 'info');
    }

    static exportTasks(tasks) {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            taskCount: tasks.length,
            tasks: tasks
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Utils.showNotification('Tasks exported successfully', 'success');
    }

    static importTasks(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.tasks || !Array.isArray(data.tasks)) {
                throw new Error('Invalid task data format');
            }
            
            // Validate each task
            const validTasks = data.tasks.filter(task => {
                const validation = Utils.validateTask(task);
                return validation.isValid;
            });
            
            if (validTasks.length !== data.tasks.length) {
                Utils.showNotification(`Imported ${validTasks.length} valid tasks (${data.tasks.length - validTasks.length} invalid tasks skipped)`, 'warning');
            } else {
                Utils.showNotification(`Successfully imported ${validTasks.length} tasks`, 'success');
            }
            
            return validTasks;
        } catch (error) {
            console.error('Error importing tasks:', error);
            Utils.showNotification('Failed to import tasks: Invalid format', 'error');
            return [];
        }
    }

    // Settings Storage Methods
    static saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    static loadSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            const defaultSettings = {
                theme: 'light',
                sortBy: 'date',
                itemsPerPage: 10,
                showCompleted: true
            };
            
            return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }
}