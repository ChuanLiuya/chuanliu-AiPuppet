<template>
  <div class="page page-center">
    <NEmpty description="待开发">
      <template #extra>
        <span class="tip">设置功能建设中，敬请期待</span>
      </template>
    </NEmpty>
  </div>
</template>

<style scoped>
.page-center {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tip {
  color: #999;
  font-size: 13px;
}
</style>
