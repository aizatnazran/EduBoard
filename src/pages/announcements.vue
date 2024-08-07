<script setup>
import loader from '@/shared/components/loader.vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTheme } from 'vuetify';
import { supabase } from '../lib/supaBaseClient.js';

const truncate = (text, length, suffix = '...') => {
  if (text.length > length) {
    return text.substring(0, length) + suffix
  }
  return text
}

// Components

const announcementsList = ref([])
const createAnnouncementDialog = ref(false)
const newAnnouncement = ref('')
const showAnnouncementDialog = ref(false)
const selectedAnnouncement = ref({})
const vuetifyTheme = useTheme()
const sheet = ref(false)
const announcementTitle = ref(null);
let isLoading = ref(false);

const createAnnouncement = async () => {
  isLoading.value = true;
  try {
    const { error } = await supabase.from('announcement').insert([
      {
        announcement_desc: newAnnouncement.value,
        announcement_teacher: teacherId,
        announcement_title: announcementTitle.value,
      },
    ])

    if (error) throw error

    // Refresh the announcements list
    announcementsList.value = await fetchAnnouncements()

    // Reset the form and close the dialog
    newAnnouncement.value = ''
    announcementTitle.value = ''
    createAnnouncementDialog.value = false

    Swal.fire({
      title: 'Success!',
      text: 'Announcement created successfully.',
      icon: 'success',
    })
  } catch (error) {
    console.error('Error creating announcement:', error)
    Swal.fire({
      title: 'Error!',
      text: `Error creating announcement: ${error.message}`,
      icon: 'error',
    })
  } finally {
    isLoading.value = false;
    await axios.post('http://118.107.204.65:3000/announcement')
  }
}
// const props = defineProps({

//   data: {
//     sheet: false,
//   },

// })
const userUUID = localStorage.getItem('uuid')
const teacherId = localStorage.getItem('teacher_id')

async function fetchAnnouncements() {
  isLoading.value = true;
  let { data: announcements, error } = await supabase
    .from('announcement')
    .select(
      `
      *,
      teacher:announcement_teacher ( name )
    `,
    ) // Assuming you have set up foreign key relation correctly
    .order('created_at', { ascending: false })

  if (error) {
    console.log('Error fetching announcements:', error)
    isLoading.value = false;
    return []
  }
  isLoading.value = false;
  console.log(isLoading);
  // Process data if necessary, e.g., formatting dates
  console.log(announcements)
  return announcements
}

const openAnnouncement = announcement => {
  console.log('Selected announcement:', announcement)

  // Check if the announcement has a teacher property
  if (!announcement.teacher) {
    console.error('Announcement does not have teacher information:', announcement)
    // Set a default teacher object with an empty name
    announcement.teacher = { name: 'Unknown' }
  }

  selectedAnnouncement.value = announcement
  showAnnouncementDialog.value = true
}

const isEditing = ref(false)
const editedAnnouncementDesc = ref('')

const startEditing = () => {
  editedAnnouncementDesc.value = selectedAnnouncement.value.announcement_desc
  isEditing.value = true
}

const saveEdit = async () => {
  try {
    const { error } = await supabase
      .from('announcement')
      .update({ announcement_desc: editedAnnouncementDesc.value })
      .eq('id', selectedAnnouncement.value.id)

    if (error) throw error

    // Update announcements list
    announcementsList.value = await fetchAnnouncements()
    showAnnouncementDialog.value = false
  } catch (error) {
    console.error('Error updating announcement:', error)
    Swal.fire('Error!', 'Could not update the announcement.', 'error')
  } finally {
    isEditing.value = false;
  }
}

const deleteAnnouncement = async () => {
  try {
    const { error } = await supabase.from('announcement').delete().eq('id', selectedAnnouncement.value.id)

    if (error) throw error

    // Update announcements list
    announcementsList.value = await fetchAnnouncements()
    showAnnouncementDialog.value = false
  } catch (error) {
    console.error('Error deleting announcement:', error)
    Swal.fire('Error!', 'Could not delete the announcement.', 'error')
  }
}

onMounted(async () => {
  announcementsList.value = await fetchAnnouncements()
})
</script>

<template>
  <loader v-if="isLoading" />
  <VRow>
    <VSpacer />
    <VBtn
      color="primary"
      @click="createAnnouncementDialog = true"
    >
      Create Announcement
    </VBtn>
  </VRow>
  <div>
    <VContainer>
      <!-- Submitted Document Docs -->
      <VRow>
          <VChip class="mb-3 mt-6">
            <p class="text-title ma-5">Announcements</p>
          </VChip>
        </VRow>

      <VRow class="flex justify-start">
        <VCard
          class="announcement-card ma-1"
          v-for="announcement in announcementsList"
          :key="announcement.id"
          @click="openAnnouncement(announcement)"
          :cols="12"
          :sm="6"
          :md="6"
          :xl="6"
          :lg="6"
        >
          <div class="announcement-content">
            <!-- Use optional chaining to safely access nested properties -->
            <h3>{{ announcement.announcement_title || 'No title' }}</h3>
            <p>{{ truncate(announcement.announcement_desc, 100) }}</p>
            <p class="timestamp">{{ announcement.teacher?.name }}, {{ new Date(announcement.created_at).toLocaleString() }}</p>
          </div>
        </VCard>
      </VRow>
    </VContainer>
    <VDialog
      v-model="showAnnouncementDialog"
      persistent
      max-width="600px"
    >
      <VCard class="pa-3">
        <VCardTitle>{{ selectedAnnouncement.announcement_title || 'No title' }}</VCardTitle>

        <VCardText v-if="!isEditing">
          {{ selectedAnnouncement.announcement_desc }}
        </VCardText>
        <VTextarea
          v-else
          v-model="editedAnnouncementDesc"
          label="Edit Announcement"
          rows="5"
        />
        <VCardActions>
          <VSpacer />
          <VBtn
            icon
            @click="startEditing"
          >
            <VIcon>mdi-pencil</VIcon>
          </VBtn>
          <VBtn
            icon
            @click="deleteAnnouncement"
          >
            <VIcon>mdi-trash-can</VIcon>
          </VBtn>
          <VBtn
            text
            @click="showAnnouncementDialog = false; isEditing = false"
            >Close</VBtn
          >
          <VBtn
            v-if="isEditing"
            color="primary"
            @click="saveEdit"
            >Save</VBtn
          >
        </VCardActions>
      </VCard>
    </VDialog>
    <div class="text-center">
      <VDialog
        v-model="createAnnouncementDialog"
        persistent
        max-width="600px"
      >
        <VCard>
          <VCardTitle>Create New Announcement</VCardTitle>
          <VCardText>
            <v-text-field
              v-model="announcementTitle"
              :counter="10"
              label="Title"
            ></v-text-field>
            <VTextarea
              v-model="newAnnouncement"
              label="Announcement Description"
              rows="5"
            />
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn
              text
              @click="createAnnouncementDialog = false"
              >Cancel</VBtn
            >
            <VBtn
              color="primary"
              @click="createAnnouncement"
              >Create</VBtn
            >
          </VCardActions>
        </VCard>
      </VDialog>
    </div>
  </div>
</template>

<style>
.high-z-index-swal {
  z-index: 9999999 !important;
}
.overlaying-component-class {
  z-index: 1050;
}

.announcement-card {
  padding: 15px;
  width: 49%;
}

.announcement-content h3 {
  font-weight: bold;
}

.announcement-content p {
  margin: 5px 0;
}

.timestamp {
  font-size: 0.8em;
  color: #777;
}

@media screen and (max-width: 960px) {
  .announcement-card {
    width: 90%
  }
}
</style>
