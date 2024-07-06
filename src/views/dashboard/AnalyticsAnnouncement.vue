<script setup>
import { supabase } from '@/lib/supaBaseClient'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const truncate = (text, length, suffix = '...') => (text.length > length ? text.substring(0, length) + suffix : text)

// Components
const announcementsList = ref([])

async function fetchAnnouncements() {
  let { data: announcements, error } = await supabase
    .from('announcement')
    .select('id, announcement_desc, created_at, teacher:announcement_teacher (name)')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching announcements:', error)
    return []
  }

  announcementsList.value = announcements
}

const goToAnnouncement = id => {
  router.push(`/announcements`)
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Latest Announcements</VCardTitle>
    </VCardItem>

    <VCardText class="pt-2">
      <VList class="card-list">
        <VListItem
          v-for="announcement in announcementsList"
          :key="announcement.id"
          @click="goToAnnouncement(announcement.id)"
        >
          <VListItemContent>
            <VListItemTitle class="text-sm font-weight-medium mb-1">
              {{ announcement.teacher.name }}
            </VListItemTitle>
            <VListItemSubtitle class="text-xs">
              {{ truncate(announcement.announcement_desc, 300) }}
            </VListItemSubtitle>
          </VListItemContent>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}
</style>
