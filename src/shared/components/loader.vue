<script setup>
const isLoading  = true;
</script>

<template>
    <v-overlay v-model="isLoading" class="h-screen w-screen d-flex justify-center align-center">
      <v-progress-circular
        :size="70"
        :width="7"
        color="purple"
        indeterminate
      ></v-progress-circular>
    </v-overlay>
</template>
