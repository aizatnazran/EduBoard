<script setup>
import { supabase } from '@/lib/supaBaseClient'
import avatar1 from '@images/avatars/avatar-1.png'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToSettings = () => {
  router.push('/account-settings')
}

const teacherName = ref('')

const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
      throw error
    }

    localStorage.removeItem('accessToken')
    localStorage.removeItem('uuid')
    localStorage.removeItem('teacher_id')

    // Notify user of successful logout
    await Swal.fire({
      title: 'Logged Out!',
      text: 'You have logged out successfully.',
      icon: 'success',
      confirmButtonColor: '#3085d6',
    })

    // Redirect to login page
    router.push('/login')
  } catch (error) {
    Swal.fire({
      title: 'Error!',
      text: 'Error during logout: ' + error.message,
      icon: 'error',
      confirmButtonColor: '#d33',
    })
  }
}

onMounted(async () => {
  const teacherId = localStorage.getItem('teacher_id')
  if (teacherId) {
    try {
      const { data, error } = await supabase.from('teacher').select('name').eq('id', teacherId).single()

      if (!error && data) {
        teacherName.value = data.name
      } else {
        console.error('Error fetching teacher name:', error?.message)
      }
    } catch (error) {
      console.error('Error during teacher name retrieval:', error.message)
    }
  }
})
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
    bordered
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">{{ teacherName }}</VListItemTitle>
            <VListItemSubtitle>Admin</VListItemSubtitle>
          </VListItem>
          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-account-outline"
                size="22"
              />
            </template>

            <VListItemTitle>Profile</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-cog-outline"
                size="22"
              />
            </template>

            <VListItemTitle
              link
              @click="goToSettings"
              >Settings</VListItemTitle
            >
          </VListItem>

          <!-- 👉 Pricing -->
          <!--
            <VListItem link>
            <template #prepend>
            <VIcon
            class="me-2"
            icon="mdi-currency-usd"
            size="22"
            />
            </template>

            <VListItemTitle>Pricing</VListItemTitle>
            </VListItem> 
          -->

          <!-- 👉 FAQ -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-face-agent"
                size="22"
              />
            </template>

            <VListItemTitle>Customer Support</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem @click="logout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="mdi-logout"
                size="22"
              />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
