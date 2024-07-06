<script setup>
import AnalyticsAnnouncement from '@/views/dashboard/AnalyticsAnnouncement.vue'
import AnalyticsPerformance from '@/views/dashboard/AnalyticsPerformance.vue'
import AnalyticsProfile from '@/views/dashboard/AnalyticsProfile.vue'
import AnalyticsTotalProfitLineCharts from '@/views/dashboard/AnalyticsTotalProfitLineCharts.vue'
import AnalyticsTransactions from '@/views/dashboard/AnalyticsTransactions.vue'
</script>

<template>
  <VRow class="match-height">
    <VCol
      cols="12"
      md="4"
    >
      <AnalyticsProfile />
    </VCol>

    <VCol
      cols="12"
      md="8"
    >
      <AnalyticsTransactions />
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <AnalyticsPerformance />
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <AnalyticsAnnouncement />
    </VCol>
    <VCol
      cols="12"
      md="4"
    >
      <AnalyticsTotalProfitLineCharts />
    </VCol>
  </VRow>
</template>
