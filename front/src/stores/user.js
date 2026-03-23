import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const contacts = ref([])

  const notifications = ref({
    messages: [],
    friendRequests: [],
    statusAlerts: []
  })

  const isAuthenticated = computed(() => !!token.value)

  function initialize() {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) user.value = JSON.parse(savedUser)
    } catch (e) {
      localStorage.removeItem('user')
    }
  }

  function login(userData, userToken) {
    user.value = userData
    token.value = userToken
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    notifications.value = { messages: [], friendRequests: [], statusAlerts: [] }
    contacts.value = []
  }

  const removeContact = (contactId) => {
    contacts.value = contacts.value.filter(c => c.id !== contactId)
    removeMessageNotification(contactId)
    addSuccessAlert("Contact supprimé avec succès")
  }

  function addMessageNotification(contactId) {
    if (!notifications.value.messages.includes(contactId)) {
      notifications.value.messages.push(contactId)
    }
  }

  function removeMessageNotification(contactId) {
    notifications.value.messages = notifications.value.messages.filter(id => id !== contactId)
  }

  function addFriendRequests(fromUser) {
    if (!notifications.value.friendRequests.some(u => u.id === fromUser.id)) {
      notifications.value.friendRequests.push(fromUser)
    }
  }

  function acceptFriendRequest(senderId) {
    notifications.value.friendRequests = notifications.value.friendRequests.filter(u => u.id !== senderId)
    addSuccessAlert("Nouvel ami ajouté !")
  }

  function addSuccessAlert(message) {
    const alert = { id: Date.now(), message }
    notifications.value.statusAlerts.push(alert)
    setTimeout(() => {
      notifications.value.statusAlerts = notifications.value.statusAlerts.filter(a => a.id !== alert.id)
    }, 4000)
  }

  function addStatusAlert(friendName, status) {
    const message = `${friendName} est désormais ${status === 'online' ? 'en ligne' : 'hors-ligne'}`
    addSuccessAlert(message)
  }

  function clearFriendNotifications() {
    notifications.value.friendRequests = []
  }

  return {
    user,
    token,
    contacts,
    isAuthenticated,
    notifications,
    initialize,
    login,
    logout,
    removeContact,
    addMessageNotification,
    removeMessageNotification,
    addFriendRequests,
    addStatusAlert,
    clearFriendNotifications,
    acceptFriendRequest,
    addSuccessAlert
  }
})