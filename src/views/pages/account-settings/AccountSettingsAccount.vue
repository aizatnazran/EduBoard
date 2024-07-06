<script setup>
import { supabase } from '@/lib/supaBaseClient'
import avatar1 from '@images/avatars/avatar-1.png'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'

const teacherId = localStorage.getItem('id')

const accountDataLocal = ref({
  avatarImg: avatar1,
  name: null,
  email: null,
  phone: null,
  department: null,
  address: null,
  state: null,
  zipcode: null,
  country: null,
})

const refInputEl = ref()
const isAccountDeactivated = ref(false)

const resetForm = () => {
  fetchteacherData()
}

const changeAvatar = file => {
  const fileReader = new FileReader()
  const { files } = file.target
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') accountDataLocal.value.avatarImg = fileReader.result
    }
  }
}

const resetAvatar = () => {
  accountDataLocal.value.avatarImg = accountData.avatarImg
}

const fetchteacherData = async () => {
  const teacherId = localStorage.getItem('teacher_id')

  try {
    const { data, error } = await supabase
      .from('teacher')
      .select(
        `
        name,
        email,
        phone,
        department,
        address,
        state,
        zipcode,
        country
      `,
      )
      .eq('id', teacherId)
      .single()

    if (error) throw new Error(error.message)

    if (data) {
      accountDataLocal.value = {
        ...accountDataLocal.value,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        address: data.address,
        state: data.state,
        zipcode: data.zipcode,
        country: data.country,
      }
    }
  } catch (error) {
    console.error('Error fetching teacher data:', error)
  }
}

const saveChanges = async () => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to save the changes?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, save it!',
  }).then(async result => {
    if (result.isConfirmed) {
      const updateData = { ...accountDataLocal.value }
      delete updateData.avatarImg
      delete updateData.businessType

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === undefined) {
          updateData[key] = null
        }
      })

      try {
        const { error } = await supabase.from('teacher').update(updateData).eq('id', teacherId)

        if (error) throw new Error(error.message)

        Swal.fire('Saved!', 'Changes saved successfully.', 'success')
      } catch (error) {
        console.error('Error updating teacher data:', error.message)
        Swal.fire('Error!', 'Error saving changes: ' + error.message, 'error')
      }
    }
  })
}
onMounted(fetchteacherData)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Account Details">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="accountDataLocal.avatarImg"
          />

          <!-- 👉 Upload Photo -->
          <form class="d-flex flex-column justify-center gap-5">
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                color="primary"
                @click="refInputEl?.click()"
              >
                <VIcon
                  icon="mdi-cloud-upload-outline"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">Upload new photo</span>
              </VBtn>

              <input
                ref="refInputEl"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @input="changeAvatar"
              />

              <VBtn
                type="reset"
                color="error"
                variant="tonal"
                @click="resetAvatar"
              >
                <span class="d-none d-sm-block">Reset</span>
                <VIcon
                  icon="mdi-refresh"
                  class="d-sm-none"
                />
              </VBtn>
            </div>

            <p class="text-body-1 mb-0">Allowed JPG, GIF or PNG. Max size of 800K</p>
          </form>
        </VCardText>

        <VDivider />

        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.name"
                  label="Name"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.email"
                  label="Phone"
                  type="email"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.phone"
                  label="Phone"
                />
              </VCol>

              <!-- 👉 Department -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.department"
                  label="Department"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.address"
                  label="Address"
                />
              </VCol>

              <!-- 👉 State -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.state"
                  label="State"
                />
              </VCol>

              <!-- 👉 Zip Code -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.zipcode"
                  label="Zip Code"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol
                cols="12"
                md="6"
              >
                <VSelect
                  v-model="accountDataLocal.country"
                  label="Country"
                  :items="['Malaysia', 'USA', 'Canada', 'UK', 'India', 'Australia']"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn @click="saveChanges">Save changes</VBtn>

                <VBtn
                  color="secondary"
                  variant="tonal"
                  type="reset"
                  @click.prevent="resetForm"
                >
                  Reset
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- 👉 Deactivate Account -->
      <VCard title="Deactivate Account">
        <VCardText>
          <div>
            <VCheckbox
              v-model="isAccountDeactivated"
              label="I confirm my account deactivation"
            />
          </div>

          <VBtn
            :disabled="!isAccountDeactivated"
            color="error"
            class="mt-3"
          >
            Deactivate Account
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
