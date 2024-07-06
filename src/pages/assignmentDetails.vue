<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../lib/supaBaseClient.js';

  const router = useRoute()
  const assignmentId = router.params.id;
  let details = ref({});

  const getDetails = async () => {
    try {
      const {data, err} = await supabase.from('assignment').select(`*,class ( classname ), uploadfile (uploadfile_filename)`).eq('id', assignmentId);
      details.value = data[0];
    } catch (err) {
      console.log(err);
    }
  }

  const sendNotification = async () => {
    await axios.post('http://118.107.204.65:3000/assignment')
  }

  onMounted(async () => {
    getDetails();
  })
</script>
<template>
  <div class="d-flex justify-end">
    <v-btn @click="sendNotification">Send Notification</v-btn>
  </div>
  <v-container>
    <v-row>
      <v-col cols="12" sm="4">
        <div class="font-weight-medium">Title</div>
        <div class="text-h5">{{ details.title }}</div>
      </v-col>
      <v-col cols="12" sm="4">
        <div class="font-weight-medium">Class</div>
        <div class="text-h5">{{ details.class?.classname }}</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <div class="font-weight-medium">Attachment</div>
        <div class="text-h5">
          <a :href="details.attachment_url" target="_blank">{{ details.uploadfile?.uploadfile_filename }}</a>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <div class="font-weight-medium">Description</div>
        <div class="text-h5">{{ details.description }}</div>
      </v-col>
    </v-row>
  </v-container>
</template>
