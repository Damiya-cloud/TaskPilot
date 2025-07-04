class TaskPilot {
    constructor() {
        this.tasks = [];
        this.meetings = [];
        this.activeTimer = null;
        this.timerInterval = null;
        this.init();
    }
    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderTasks();
        this.renderMeetings();
        this.updateTotalTime();
        this.checkMeetings();
        setInterval(() => this.checkMeetings(), 60000);
        setInterval(() => this.validateTimers(), 5000);
    }
    setupEventListeners() {
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showAddTaskForm());
        document.getElementById('saveTaskBtn').addEventListener('click', () => this.saveTask());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.hideAddTaskForm());
        document.getElementById('addMeetingBtn').addEventListener('click', () => this.showAddMeetingForm());
        document.getElementById('saveMeetingBtn').addEventListener('click', () => this.saveMeeting());
        document.getElementById('cancelMeetingBtn').addEventListener('click', () => this.hideAddMeetingForm());
        document.getElementById('taskNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveTask();
        });
    }
    // Task Management
    showAddTaskForm() {
        document.getElementById('addTaskForm').classList.remove('hidden');
        document.getElementById('taskNameInput').focus();
    }
    hideAddTaskForm() {
        document.getElementById('addTaskForm').classList.add('hidden');
        document.getElementById('taskNameInput').value = '';
    }
    async saveTask() {
        const taskName = document.getElementById('taskNameInput').value.trim();
        if (!taskName) return;
        const task = {
            id: Date.now(),
            name: taskName,
            totalTime: 0,
            isRunning: false,
            startTime: null,
            todayTime: 0
        };
        this.tasks.push(task);
        await this.saveData();
        this.renderTasks();
        this.hideAddTaskForm();
        this.updateTotalTime();
    }
    async deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        if (this.activeTimer && this.activeTimer.id === taskId) {
            this.stopTimer();
        }
        await this.saveData();
        this.renderTasks();
        this.updateTotalTime();
    }
    async resetTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        if (task.isRunning) {
            this.stopTimer();
        }
        task.totalTime = 0;
        task.todayTime = 0;
        task.startTime = null;
        task.isRunning = false;
        await this.saveData();
        this.renderTasks();
        this.updateTotalTime();
    }
    async toggleTimer(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        if (task.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer(taskId);
        }
    }
    startTimer(taskId) {
        if (this.activeTimer) {
            this.stopTimer();
        }
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        task.isRunning = true;
        task.startTime = Date.now();
        this.activeTimer = task;
        this.timerInterval = setInterval(() => {
            this.updateRunningTaskDisplay(taskId);
        }, 100);
        this.renderTasks();
        this.saveData();
    }
    async stopTimer() {
        if (!this.activeTimer) return;
        this.activeTimer.isRunning = false;
        if (this.activeTimer.startTime) {
            const elapsed = Date.now() - this.activeTimer.startTime;
            this.activeTimer.totalTime += elapsed;
            this.activeTimer.todayTime += elapsed;
        }
        this.activeTimer.startTime = null;
        this.activeTimer = null;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        await this.saveData();
        this.renderTasks();
        this.updateTotalTime();
    }
    updateTaskTime(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.isRunning) return;
        this.renderTasks();
        this.updateTotalTime();
    }
    updateRunningTaskDisplay(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.isRunning) return;
        const timeDisplay = document.querySelector(`[data-timer="${taskId}"]`);
        if (timeDisplay) {
            const currentTime = this.getCurrentTaskTime(task);
            timeDisplay.textContent = this.formatTime(currentTime);
        }
        this.updateTotalTime();
    }
    getCurrentTaskTime(task) {
        if (!task.isRunning || !task.startTime) {
            return task.totalTime;
        }
        return task.totalTime + (Date.now() - task.startTime);
    }
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const formattedSeconds = seconds.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        if (hours > 0) {
            return `${hours}h ${formattedMinutes}m ${formattedSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${formattedSeconds}s`;
        } else {
            return `${formattedSeconds}s`;
        }
    }
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        if (this.tasks.length === 0) {
            tasksList.innerHTML = `<div class="empty-state"><p class="text-sm">No tasks yet. Add your first task to get started!</p></div>`;
            return;
        }
        this.tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'bg-white-90 backdrop-blur-sm rounded-lg p-3 shadow-sm';
            taskElement.setAttribute('data-task-container', task.id);
            const currentTime = this.getCurrentTaskTime(task);
            const isRunning = task.isRunning;
            taskElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h3 class="font-medium text-text-primary text-sm">${task.name}</h3>
                        <p class="text-xs text-text-secondary timer-display" data-timer="${task.id}">${this.formatTime(currentTime)}</p>
                    </div>
                    <div class="flex gap-2">
                        <button data-action="toggle" data-task-id="${task.id}" class="${isRunning ? 'bg-orange-300 hover--bg-orange-400' : 'bg-pastel-green hover--bg-green-300'} text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200">${isRunning ? 'Pause' : 'Play'}</button>
                        <button data-action="reset" data-task-id="${task.id}" class="bg-gray-300 hover--bg-gray-400 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-200">Reset</button>
                        <button data-action="delete" data-task-id="${task.id}" class="bg-red-300 hover--bg-red-400 text-white px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-200">Delete</button>
                    </div>
                </div>
            `;
            const toggleBtn = taskElement.querySelector('[data-action="toggle"]');
            const resetBtn = taskElement.querySelector('[data-action="reset"]');
            const deleteBtn = taskElement.querySelector('[data-action="delete"]');
            toggleBtn.addEventListener('click', () => this.toggleTimer(task.id));
            resetBtn.addEventListener('click', () => this.resetTask(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            tasksList.appendChild(taskElement);
        });
    }
    updateTotalTime() {
        const totalTime = this.tasks.reduce((total, task) => {
            return total + this.getCurrentTaskTime(task);
        }, 0);
        const totalSeconds = Math.floor(totalTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        document.getElementById('totalTime').textContent = `${hours}h ${minutes}m`;
    }
    validateTimers() {
        const runningTasks = this.tasks.filter(task => task.isRunning);
        if (runningTasks.length > 0 && !this.timerInterval) {
            const activeTask = runningTasks[0];
            this.activeTimer = activeTask;
            this.timerInterval = setInterval(() => {
                this.updateRunningTaskDisplay(activeTask.id);
            }, 100);
        }
        if (runningTasks.length === 0 && this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.activeTimer = null;
        }
    }
    // Meeting Management
    showAddMeetingForm() {
        document.getElementById('addMeetingForm').classList.remove('hidden');
        document.getElementById('meetingNameInput').focus();
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const defaultTime = now.toISOString().slice(0, 16);
        document.getElementById('meetingTimeInput').value = defaultTime;
    }
    hideAddMeetingForm() {
        document.getElementById('addMeetingForm').classList.add('hidden');
        document.getElementById('meetingNameInput').value = '';
        document.getElementById('meetingUrlInput').value = '';
        document.getElementById('meetingTimeInput').value = '';
    }
    async saveMeeting() {
        const name = document.getElementById('meetingNameInput').value.trim();
        const url = document.getElementById('meetingUrlInput').value.trim();
        const time = document.getElementById('meetingTimeInput').value;
        if (!name || !url || !time) {
            alert('Please fill in all meeting details');
            return;
        }
        const meeting = {
            id: Date.now(),
            name,
            url,
            time: new Date(time).getTime(),
            completed: false
        };
        this.meetings.push(meeting);
        await this.saveData();
        this.renderMeetings();
        this.hideAddMeetingForm();
        this.scheduleAlarm(meeting);
    }
    async deleteMeeting(meetingId) {
        this.meetings = this.meetings.filter(meeting => meeting.id !== meetingId);
        await this.saveData();
        this.renderMeetings();
        chrome.alarms.clear(`meeting_${meetingId}`);
    }
    renderMeetings() {
        const meetingsList = document.getElementById('meetingsList');
        meetingsList.innerHTML = '';
        const activeMeetings = this.meetings.filter(meeting =>
            !meeting.completed || new Date(meeting.time) > new Date()
        );
        if (activeMeetings.length === 0) {
            meetingsList.innerHTML = `<div class="empty-state"><p class="text-sm">No upcoming meetings scheduled.</p></div>`;
            return;
        }
        activeMeetings.forEach(meeting => {
            const meetingElement = document.createElement('div');
            meetingElement.className = 'bg-white-90 backdrop-blur-sm rounded-lg p-3 shadow-sm';
            const meetingTime = new Date(meeting.time);
            const timeString = meetingTime.toLocaleString();
            meetingElement.innerHTML = `
                <div class="meeting-card">
                    <div class="flex items-start justify-between">
                        <div class="meeting-content">
                            <h3 class="font-medium text-text-primary text-sm">${meeting.name}</h3>
                            <p class="text-xs text-text-secondary mb-1">${timeString}</p>
                            <p class="text-xs text-blue-600 meeting-url" title="${meeting.url}">${meeting.url.length > 32 ? meeting.url.slice(0,32)+'...' : meeting.url}</p>
                        </div>
                        <div class="meeting-actions">
                            <button data-action="join" data-meeting-url="${meeting.url}" class="bg-pastel-blue hover--bg-blue-300 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200">Join</button>
                            <button data-action="delete" data-meeting-id="${meeting.id}" class="bg-red-300 hover--bg-red-400 text-white px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-200">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            const joinBtn = meetingElement.querySelector('[data-action="join"]');
            const deleteBtn = meetingElement.querySelector('[data-action="delete"]');
            joinBtn.addEventListener('click', () => this.openMeeting(meeting.url));
            deleteBtn.addEventListener('click', () => this.deleteMeeting(meeting.id));
            meetingsList.appendChild(meetingElement);
        });
    }
    openMeeting(url) {
        chrome.tabs.create({ url: url });
    }
    checkMeetings() {
        const now = new Date().getTime();
        this.meetings.forEach(meeting => {
            if (!meeting.completed && Math.abs(now - meeting.time) < 60000) {
                meeting.completed = true;
                this.openMeeting(meeting.url);
                this.saveData();
            }
        });
    }
    scheduleAlarm(meeting) {
        const alarmTime = meeting.time;
        chrome.alarms.create(`meeting_${meeting.id}`, { when: alarmTime });
    }
    async loadData() {
        try {
            const result = await chrome.storage.local.get(['tasks', 'meetings']);
            this.tasks = result.tasks || [];
            this.meetings = result.meetings || [];
            const today = new Date().toDateString();
            const lastDate = await chrome.storage.local.get(['lastDate']);
            if (lastDate.lastDate !== today) {
                this.tasks.forEach(task => {
                    task.todayTime = 0;
                    task.isRunning = false;
                    task.startTime = null;
                });
                await chrome.storage.local.set({ lastDate: today });
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    async saveData() {
        try {
            await chrome.storage.local.set({
                tasks: this.tasks,
                meetings: this.meetings
            });
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    // Reemplaza la función showModal para que use solo clases CSS:
    showModal(title, html, cb, multi) {
        const modal = document.getElementById('modal');
        modal.innerHTML = `
      <div class="modal-bg">
        <div class="modal-content">
          <div style="font-weight:600;font-size:1.1rem;margin-bottom:10px;">${title}</div>
          <form id="modalForm">
            ${html}
            <div class="flex gap-2" style="margin-top:10px;">
              <button type="submit" class="bg-pastel-blue text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex-1">OK</button>
              <button type="button" class="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex-1" id="cancelModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;
        modal.style.display = '';
        const form = document.getElementById('modalForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            if (multi) {
                const vals = Array.from(form.querySelectorAll('input')).map(i=>i.value.trim());
                cb && cb(vals[0], vals);
            } else {
                const val = form.querySelector('input').value.trim();
                cb && cb(val);
            }
            modal.style.display = 'none';
        };
        document.getElementById('cancelModal').onclick = () => {
            modal.style.display = 'none';
        };
    }
}
const taskPilot = new TaskPilot();
