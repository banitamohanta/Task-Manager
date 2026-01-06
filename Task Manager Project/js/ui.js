// DOM manipulation functions

class UI {
    constructor() {
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
    }

    // Task Rendering
    renderTasks(tasks) {
        if (tasks.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        const tasksHTML = tasks.map(task => this.createTaskHTML(task)).join('');
        this.taskList.innerHTML = tasksHTML;
    }

    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const dueDateHTML = task.dueDate ? 
            `<span class="due-date"><i class="far fa-calendar"></i> ${Utils.formatDate(task.dueDate)}</span>` : '';
        
        return `
            <li class="task-item ${completedClass} ${priorityClass}" data-id="${task.id}" draggable="true">
                <div class="task-content">
                    <div class="task-header">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-text">${this.escapeHTML(task.text)}</span>
                    </div>
                    <div class="task-footer">
                        <div class="task-meta">
                            ${Utils.createPriorityBadge(task.priority)}
                            <span class="created-date">
                                <i class="far fa-clock"></i> ${Utils.formatDate(task.createdAt)}
                            </span>
                            ${dueDateHTML}
                        </div>
                        <div class="task-actions">
                            <button class="btn-icon edit-btn" title="Edit task">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete-btn" title="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        `;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Empty State Handling
    showEmptyState() {
        this.emptyState.style.display = 'block';
        this.taskList.style.display = 'none';
    }

    hideEmptyState() {
        this.emptyState.style.display = 'none';
        this.taskList.style.display = 'block';
    }

    // Statistics Update
    updateStatistics(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const active = total - completed;
        const highPriority = tasks.filter(task => task.priority === 'high').length;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('activeTasks').textContent = active;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('highPriorityTasks').textContent = highPriority;
    }

    // Filter Status Update
    updateFilterStatus(filter) {
        const filterText = filter.charAt(0).toUpperCase() + filter.slice(1);
        document.getElementById('filterStatus').textContent = `(${filterText})`;
    }

    // Modal Control
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Form Handling
    clearForm() {
        document.getElementById('taskInput').value = '';
        document.getElementById('priority').value = 'medium';
        document.getElementById('dueDate').value = '';
        document.getElementById('taskInput').focus();
    }

    // Filter Button State
    updateFilterButtons(currentFilter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.filter === currentFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Drag and Drop
    initializeDragAndDrop() {
        let draggedTask = null;

        this.taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                draggedTask = e.target;
                setTimeout(() => {
                    draggedTask.style.opacity = '0.5';
                }, 0);
            }
        });

        this.taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (afterElement == null) {
                this.taskList.appendChild(draggable);
            } else {
                this.taskList.insertBefore(draggable, afterElement);
            }
        });

        this.taskList.addEventListener('dragend', (e) => {
            if (draggedTask) {
                draggedTask.style.opacity = '1';
                draggedTask = null;
            }
        });
    }

    getDragAfterElement(y) {
        const draggableElements = [...this.taskList.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}