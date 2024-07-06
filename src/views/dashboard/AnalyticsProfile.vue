<script setup>
import { supabase } from '@/lib/supaBaseClient'
import triangleDark from '@images/misc/triangle-dark.png'
import triangleLight from '@images/misc/triangle-light.png'
import trophy from '@images/misc/trophy.png'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router' // Import useRouter
import { useTheme } from 'vuetify'

// Vue Composition API References
const { global } = useTheme()
const router = useRouter() // Use Vue Router
const teacherName = ref('')

const triangleBg = computed(() => (global.name.value === 'light' ? triangleLight : triangleDark))

const viewAssignments = () => {
  router.push('/assignments')
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
  <VCard
    subtitle="Welcome to EduBoard,"
    class="position-relative"
  >
    <h2 class="ml-5 text-2xl font-weight-bold text-black">Teacher {{ teacherName }}</h2>
    <VCardText>
      <h5 class="text-2xl font-weight-medium text-primary">5 Students</h5>
      <p>out of 36 students have submitted 🚀</p>
      <VBtn
        size="small"
        @click="viewAssignments"
      >
        View Submitted Assignments</VBtn
      >
    </VCardText>

    <!-- Triangle Background -->
    <VImg
      :src="triangleBg"
      class="triangle-bg flip-in-rtl"
    />

    <!-- Trophy -->
    <VImg
      :src="trophy"
      class="trophy"
    />
  </VCard>
</template>

<style lang="scss">
@use '@layouts/styles/mixins' as layoutsMixins;

.v-card .triangle-bg {
  position: absolute;
  inline-size: 10.375rem;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.v-card .trophy {
  position: absolute;
  inline-size: 4.9375rem;
  inset-block-end: 2rem;
  inset-inline-end: 2rem;
}
</style>
