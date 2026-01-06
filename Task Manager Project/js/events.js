// Event handlers

class EventManager {
    constructor(taskManager, ui) {
        this.taskManager = taskManager;
        this.ui = ui;
        this.debouncedSearch = Utils.debounce(this.handleSearch.bind(this), 300);
        this.initializeEvents();
    }

    initializeEvents() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', this.handleAddTask.bind(this));
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', this.handleFilter.bind(this));
        });
        
        // Search input
        document.getElementById('searchInput').addEventListener('input', this.debouncedSearch);
        
        // Bulk actions
        document.getElementById('clearCompleted').addEventListener('click', this.handleClearCompleted.bind(this));
        document.getElementById('exportTasks').addEventListener('click', this.handleExportTasks.bind(this));
        document.getElementById('importTasks').addEventListener('click', this.handleImportTasks.bind(this));
        
        // Sort options
        document.getElementById('sortBy').addEventListener('change', this.handleSort.bind(this));
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', this.handleThemeToggle.bind(this));
        
        // Import modal
        document.getElementById('cancelImport').addEventListener('click', () => {
            this.ui.hideModal('importModal');
        });
        
        document.getElementById('confirmImport').addEventListener('click', this.handleConfirmImport.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Delegate task list events
        document.getElementById('taskList').addEventListener('click', this.handleTaskListClick.bind(this));
        
        // Initialize drag and drop
        this.ui.initializeDragAndDrop();
    }

    handleAddTask(e) {
        e.preventDefault();
        
        const taskInput = document.getElementById('taskInput');
        const priority = document.getElementById('priority').value;
        const dueDate = document.getElementById('dueDate').value;
        
        const task = {
            text: taskInput.value.trim(),
            priority: priority,
            dueDate: dueDate || null
        };
        
        const validation = Utils.validateTask(task);
        
        if (!validation.isValid) {
            Utils.showNotification(validation.errors[0], 'error');
            return;
        }
        
        this.taskManager.addTask(task);
        this.ui.clearForm();
        Utils.showNotification('Task added successfully', 'success');
    }

    handleFilter(e) {
        const filter = e.target.dataset.filter;
        this.taskManager.setFilter(filter);
        this.ui.updateFilterButtons(filter);
        this.ui.updateFilterStatus(filter);
    }

    handleSearch(e) {
        const searchTerm = e.target.value.trim().toLowerCase();
        this.taskManager.setSearchTerm(searchTerm);
    }

    handleClearCompleted() {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            this.taskManager.clearCompleted();
            Utils.showNotification('Completed tasks cleared', 'info');
        }
    }

    handleExportTasks() {
        const tasks = this.taskManager.getTasks();
        if (tasks.length === 0) {
            Utils.showNotification('No tasks to export', 'warning');
            return;
        }
        StorageManager.exportTasks(tasks);
    }

    handleImportTasks() {
        this.ui.showModal('importModal');
    }

    handleConfirmImport() {
        const importText = document.getElementById('importText').value;
        if (!importText.trim()) {
            Utils.showNotification('Please enter JSON data to import', 'error');
            return;
        }
        
        const importedTasks = StorageManager.importTasks(importText);
        if (importedTasks.length > 0) {
            this.taskManager.importTasks(importedTasks);
            this.ui.hideModal('importModal');
            document.getElementById('importText').value = '';
        }
    }

    handleSort(e) {
        const sortBy = e.target.value;
        this.taskManager.setSortBy(sortBy);
    }

    handleThemeToggle() {
        document.body.classList.toggle('dark-theme');
        const button = document.getElementById('themeToggle');
        const icon = button.querySelector('i');
        
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'fas fa-sun';
            button.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            button.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
        
        // Save theme preference
        const settings = StorageManager.loadSettings();
        settings.theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        StorageManager.saveSettings(settings);
    }

    handleTaskListClick(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = taskItem.dataset.id;
        
        if (e.target.closest('.task-checkbox')) {
            this.taskManager.toggleTaskCompletion(taskId);
        } else if (e.target.closest('.edit-btn')) {
            this.handleEditTask(taskId);
        } else if (e.target.closest('.delete-btn')) {
            this.handleDeleteTask(taskId);
        }
    }

    handleEditTask(taskId) {
        const task = this.taskManager.getTask(taskId);
        if (!task) return;
        
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            this.taskManager.updateTask(taskId, newText.trim());
            Utils.showNotification('Task updated', 'success');
        }
    }

    handleDeleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.taskManager.deleteTask(taskId);
            Utils.showNotification('Task deleted', 'info');
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl + Enter to add task
        if (e.ctrlKey && e.key === 'Enter' && document.activeElement === document.getElementById('taskInput')) {
            document.getElementById('taskForm').dispatchEvent(new Event('submit'));
        }
        
        // Escape to clear search
        if (e.key === 'Escape' && document.activeElement === document.getElementById('searchInput')) {
            document.getElementById('searchInput').value = '';
            this.handleSearch({ target: document.getElementById('searchInput') });
        }
    }
}