<template>
  <div
    class="h-100 d-flex align-center justify-space-between"
    style="font-size: small"
  >
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center">
      &copy;
      {{ new Date().getFullYear() }}
      Provide to you
      <VIcon
        icon="mdi-heart-outline"
        color="error"
        size="1.00rem"
        class="mx-1"
      />
      By
      <a
        href="https://aserious.co"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
        >Aizat Nazran</a
      >
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="#"
        target="noopener noreferrer"
        >Latest Updates</a
      >
      <a
        href="#"
        target="noopener noreferrer"
        >Term & Condition</a
      >
      <a
        href="#"
        target="noopener noreferrer"
        >Company Policy</a
      >
    </span>
  </div>
</template>
