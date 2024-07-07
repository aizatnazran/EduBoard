<script setup>
import blankImage from '@images/images/blank.png'
import csvImage from '@images/images/csv.png'
import pdfImage from '@images/images/pdf.png'
import xlsImage from '@images/images/xls.png'

import loader from '@/shared/components/loader.vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { supabase } from '../lib/supaBaseClient.js'

// Components
const endpoint = "https://kqbgvkiwwqacwnimhrvf.supabase.co/storage/v1/object/public/assignments/";
let attachmentUrl = "";
let isLoading = ref(false);
let title = ref(null);
let desc = ref(null);
let classOptions = []; 
let assignments = ref([]);
const router = useRouter()
let listing = ref(true);
let classroom = ref(null);

const fetchClasses = async () => {
  try {
    const { data: classes, error } = await supabase.from('class').select('id, classname')

    if (error) {
      console.error('Error fetching classes:', error)
    } else {
      classOptions = classes.map((el) => {
        return {
          title: el.classname,
          value: el.id
        }
      });

      console.log(classOptions);
    }
  } catch (error) {
    console.error(error)
  }
}

function getImageSrc(fileName) {
  const extension = fileName.split('.').pop()
  switch (extension.toLowerCase()) {
    case 'csv':
      return csvImage
    case 'pdf':
      return pdfImage
    case 'xlsx':
      return xlsImage
    default:
      return blankImage
  }
}

const vuetifyTheme = useTheme()

const selectedFile = ref(null)

const handleFileChange = event => {
  selectedFile.value = event.target.files[0]
  console.log('Selected file:', selectedFile.value)
}

const sheet = ref(false)

// const props = defineProps({

//   data: {
//     sheet: false,
//   },

// })
const userUUID = localStorage.getItem('uuid')
const teacherId = localStorage.getItem('teacher_id')

const uploadFile = async () => {
  if (!selectedFile.value) {
    await Swal.fire({
      title: 'Error!',
      text: 'No file selected.',
      icon: 'error',
      customClass: {
        container: 'high-z-index-swal',
      },
    })
    return
  }

  // Get the original file name
  const originalFileName = selectedFile.value.name
  console.log('Original file name:', originalFileName)

  // Construct the new file name with uuid and original file name
  const newFileName = `${userUUID}_${originalFileName}`
  console.log('New file name for storage:', newFileName)
  attachmentUrl = endpoint + newFileName;

  const filePath = `${newFileName}` // Use new file name for the path

  // Upload to Supabase Storage with the new file name
  isLoading.value = true;
  const { error: uploadError } = await supabase.storage.from('assignments').upload(filePath, selectedFile.value)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    Swal.fire({
      title: 'Error!',
      text: 'Error uploading file.',
      icon: 'error',
      customClass: {
        container: 'high-z-index-swal',
      },
    })

    isLoading.value = false;
    return
  }

  const { data, dbError } = await supabase.from('uploadfile').insert([
    {
      uploadfile_filename: originalFileName, // Keep the original file name in the database
      uploadfile_teacher: teacherId,
      uploadfile_uuid: userUUID,
    },
  ]).select();

  if (dbError) {
    console.error('Error saving file info to database:', dbError)
    Swal.fire({
      title: 'Error!',
      text: 'Error saving file info to database.',
      icon: 'error',
      customClass: { container: 'high-z-index-swal' },
    })
    isLoading.value = false;
  }

  console.log(data);
  const { error: err } = await supabase.from('assignment').insert([
    { // Keep the original file name in the database
      title: title.value,
      description: desc.value,
      teacher_id: teacherId,
      uploadfile_id: data[0].id,
      class_id: classroom._value,
      attachment_url: attachmentUrl,
    },
  ])

  if (err) {
    console.error('Error saving assignment info to database:', dbError)
    Swal.fire({
      title: 'Error!',
      text: 'Error saving assignment info to database.',
      icon: 'error',
      customClass: { container: 'high-z-index-swal' },
    })
    isLoading.value = false;
    return;
  }

  selectedFile.value = null

  // Update the files list
  filesList.value = await fetchFiles()

  Swal.fire({
    title: 'Success!',
    text: 'Your file has been uploaded.',
    icon: 'success',
    customClass: { container: 'high-z-index-swal' },
    customClass: {
      container: 'high-z-index-swal',
    },
  })

  const axiosResponse = await axios.post('http://118.107.204.65:3000/assignment');
  isLoading.value = false;
}

async function fetchFiles() {
  const { data, err } = await supabase.from('assignment').select().eq('teacher_id', teacherId).order("created_at", { ascending: false });
  console.log(data);
  if (err) console.log('Error fetching files:', error)
  else assignments.value = data

  console.log(assignments.value);
}

const filesList = ref([])

const confirmDelete = async file => {
  Swal.fire({
    title: 'Are you sure?',
    text: `You won't be able to revert the deletion of ${file.uploadfile_filename}!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  }).then(async result => {
    if (result.isConfirmed) {
      try {
        let { error } = await supabase
          .from('uploadfile')
          .delete()
          .match({ uploadfile_filename: file.uploadfile_filename, uploadfile_teacher: teacherId })

        if (error) throw error

        // Remove the file from the filesList
        filesList.value = filesList.value.filter(f => f.uploadfile_filename !== file.uploadfile_filename)

        Swal.fire({
          title: 'Deleted!',
          text: 'Your file has been deleted.',
          icon: 'success',
        })
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'There was a problem deleting your file.',
          icon: 'error',
        })
      }
    }
  })
}

const goToDetails = (id) => {
  router.push('/assignments/details/' +  id)
  listing.value = false;
}

onMounted(async () => {
  fetchClasses()
  filesList.value = await fetchFiles()
  listing.value = true;
})
</script>

<template>
  <loader v-if="isLoading" />
  <router-view></router-view>
  <VRow v-if="listing">
    <VSpacer />
    <VBtn
      color="primary"
      v-bind="props"
      @click="sheet = !sheet"
    >
      Create Assignment
    </VBtn>
  </VRow>
  <div v-if="listing" class="mt-5">
    <VContainer>
      <!-- Submitted Document Docs -->
      <!-- <VRow>
        <VChip class="mb-3 mt-6">
          <p class="text-title ma-5">Uploaded Assignments</p>
        </VChip>
      </VRow> -->
      <v-list lines="three">
        <v-list-item
          v-for="item in assignments"
          :key="item"
          :title="item.title"
          :subtitle="item.description"
          class="border-b-md"
          @click="goToDetails(item.id)"
        ></v-list-item>
      </v-list>

      <!-- <VRow>
        <VCard
          class="document-card ma-1"
          v-for="item in assignments"
          :key="item.id"
          cols="6"
        >
          <v-btn
            icon
            flat
            color="transparent"
            class="dots-button"
            v-on="on"
            @click="confirmDelete(file)"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
          <img
            :src="getImageSrc(file.uploadfile_filename)"
            alt="Document Icon"
          />
          {{ item.id }}
          <p class="file-name">{{ file.uploadfile_filename }}</p>
        </VCard>
        <div
          v-if="assignments.length === 0"
          class="text-center my-5"
        >
          <p>No assignments uploaded yet.</p>
        </div>
      </VRow> -->
    </VContainer>

    <div class="text-center">
      <VDialog
        v-model="sheet"
        activator="parent"
        class="overlaying-component-class"
      >
        <VCard class="pa-md-10 pa-5 dialog">
          <!-- <VContainer
            class="pa-5 rounded-lg mt-2 border-2"
            style="background-color: var(--v-theme-on-surface); border: 2px solid #8a8d93"
          > -->
            <!--
                <div class="text-overline text-start ml-10">
                File Menu :
                </div> 
              -->
              <v-form v-model="valid">
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <v-text-field
                        v-model="title"
                        label="Title"
                        hide-details
                        required
                      ></v-text-field>
                    </v-col>

                    <v-col
                      cols="12"
                      md="6"
                    >
                      <v-select v-model="classroom" label="Class" :items="classOptions"></v-select>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-textarea label="Description" v-model="desc"></v-textarea>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <div class="text-overline text-start">Attachment :</div>
                      <div class="bg-red border border-sm rounded d-flex justify-center align-center pa-5" style="height: 100px" @change="handleFileChange">
                        <v-file-input @change="handleFileChange" label="File input" variant="underlined"></v-file-input>
                      </div>
                      <!-- <VFileInput
                        @change="handleFileChange"
                        counter
                        truncate-length="15"
                      /> -->
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
          <!-- </VContainer> -->
          <VBtn
            class="mt-5 mx-10"
            @click="uploadFile"
          >
            Submit
          </VBtn>
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

.document-card {
  width: 180px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  position: relative;
}

.document-card img {
  display: block; /* or 'flex' */
  width: 50px;
  height: auto; /* maintain aspect ratio */
  margin-bottom: 15px; /* horizontal auto margins for centering block elements */
}

.file-name {
  text-align: center;
  margin-bottom: 2px;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
  font-size: 12px;
  font-weight: bold;
}

.dots-button {
  position: absolute;
  top: 1px;
  right: 1px;
  z-index: 10;
}

.dialog {
    width: 60%;
    margin: auto;
  }

@media screen and (max-width: 960px) {
  .dialog {
    width: 90%
  }
}
</style>
