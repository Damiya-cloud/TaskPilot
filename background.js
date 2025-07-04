// TaskPilot background.js
// Service worker para alarmas de reuniones

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith('meeting-')) return;
  const id = Number(alarm.name.replace('meeting-',''));
  chrome.storage.local.get(['meetings'], (data) => {
    const meetings = data.meetings || [];
    const meeting = meetings.find(m => m.id === id);
    if (meeting && !meeting.completed) {
      chrome.tabs.create({url: meeting.url});
      meeting.completed = true;
      chrome.storage.local.set({meetings});
    }
  });
});
