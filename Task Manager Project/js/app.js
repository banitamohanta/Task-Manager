// Main application logic

class TaskManager {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.sortBy = 'date';
        
        this.ui = new UI();
        this.eventManager = null;
        
        this.initialize();
    }

    initialize() {
        // Load tasks from localStorage
        this.loadTasks();
        
        // Load settings
        this.loadSettings();
        
        // Initialize event manager
        this.eventManager = new EventManager(this, this.ui);
        
        // Initial render
        this.applyFilters();
    }

    // Task CRUD Operations
    addTask(taskData) {
        const task = {
            id: Utils.generateId(),
            text: taskData.text,
            priority: taskData.priority || 'medium',
            dueDate: taskData.dueDate || null,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const validation = Utils.validateTask(task);
        if (!validation.isValid) {
            Utils.showNotification(validation.errors[0], 'error');
            return;
        }

        this.tasks.push(task);
        this.saveTasks();
        this.applyFilters();
    }

    updateTask(taskId, newText) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;

        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            text: newText,
            updatedAt: new Date().toISOString()
        };

        this.saveTasks();
        this.applyFilters();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.applyFilters();
    }

    toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;

        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            completed: !this.tasks[taskIndex].completed,
            updatedAt: new Date().toISOString()
        };

        this.saveTasks();
        this.applyFilters();
    }

    clearCompleted() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.applyFilters();
    }

    // Import/Export
    importTasks(tasks) {
        tasks.forEach(task => {
            if (!this.tasks.some(t => t.id === task.id)) {
                this.tasks.push(task);
            }
        });
        this.saveTasks();
        this.applyFilters();
    }

    // Getters
    getTasks() {
        return [...this.tasks];
    }

    getTask(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    // Filtering and Sorting
    setFilter(filter) {
        this.currentFilter = filter;
        this.applyFilters();
    }

    setSearchTerm(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.applyFilters();
    }

    setSortBy(sortBy) {
        this.sortBy = sortBy;
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.tasks];

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(task =>
                task.text.toLowerCase().includes(this.searchTerm)
            );
        }

        // Apply status filter
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(task => !task.completed);
                break;
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
            case 'high':
                filtered = filtered.filter(task => task.priority === 'high');
                break;
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                default: // 'date'
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        this.filteredTasks = filtered;
        this.ui.renderTasks(this.filteredTasks);
        this.ui.updateStatistics(this.tasks);
    }

    // Persistence
    loadTasks() {
        this.tasks = StorageManager.loadTasks();
        // Migrate old task format if needed
        this.tasks = this.tasks.map(task => ({
            ...task,
            priority: task.priority || 'medium',
            dueDate: task.dueDate || null
        }));
    }

    saveTasks() {
        StorageManager.saveTasks(this.tasks);
    }

    loadSettings() {
        const settings = StorageManager.loadSettings();
        this.sortBy = settings.sortBy;
        
        // Apply theme
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            const button = document.getElementById('themeToggle');
            if (button) {
                button.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            }
        }
        
        // Update sort dropdown
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.value = this.sortBy;
        }
    }
}

// Initialize the application
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});