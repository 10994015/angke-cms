import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosClient from '../axios'

export const usePermissionStore = defineStore('permission', () => {
  const roles              = ref({ data: [], total: 0, totalPages: 1, page: 1 })
  const role               = ref(null)
  const permissionCategories = ref([])
  const isLoading          = ref(false)

  const fetchRoles = async (params = {}) => {
    isLoading.value = true
    try {
      const res = await axiosClient.get('/backend/auth/role', { params })
      roles.value = res.data.data || { data: [], total: 0, totalPages: 1, page: 1 }
      return roles.value
    } finally {
      isLoading.value = false
    }
  }

  const fetchRoleById = async (id) => {
    isLoading.value = true
    try {
      const res = await axiosClient.get(`/backend/auth/role/${id}`)
      role.value = res.data.data
      return role.value
    } finally {
      isLoading.value = false
    }
  }

  const fetchPermissionCategories = async () => {
    const res = await axiosClient.get('/backend/auth/permission')
    const items = []
    for (const cat of (res.data.data || [])) {
      for (const perm of (cat.permissions || [])) {
        items.push({ id: perm.id, category: cat.category, name: perm.name, mode: perm.mode })
      }
    }
    permissionCategories.value = items
    return items
  }

  const createRole = async (data) => {
    const res = await axiosClient.post('/backend/auth/role', {
      name:            data.name,
      status:          data.status,
      rolePermissions: data.permissions
        .filter(p => p.mode !== '')
        .map(p => ({ permissionId: p.id, mode: p.mode })),
    })
    return res.data
  }

  const updateRole = async (id, data) => {
    const res = await axiosClient.patch(`/backend/auth/role/${id}`, {
      name:            data.name,
      status:          data.status,
      rolePermissions: data.permissions
        .filter(p => p.mode !== '')
        .map(p => ({ permissionId: p.id, mode: p.mode })),
    })
    return res.data
  }

  const deleteRole = async (id) => {
    const res = await axiosClient.delete(`/backend/auth/role/${id}`)
    return res.data
  }

  const fetchRoleUsers = async (id, params = {}) => {
    const res = await axiosClient.get(`/backend/auth/role/${id}/user`, { params })
    return res.data.data
  }

  const updateRoleUsers = async (id, users) => {
    const res = await axiosClient.patch(`/backend/auth/role/${id}/user`, { updateRoleUsers: users })
    return res.data
  }

  return {
    roles, role, permissionCategories, isLoading,
    fetchRoles, fetchRoleById, fetchPermissionCategories,
    createRole, updateRole, deleteRole,
    fetchRoleUsers, updateRoleUsers,
  }
})
