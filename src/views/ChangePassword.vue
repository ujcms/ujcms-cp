<template>
  <el-dialog
    :title="$t('changePassword')"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @opened="
      focus?.focus();
      form.resetFields();
    "
  >
    <el-form ref="form" :model="values" v-loading="loading" label-width="150px" label-position="right">
      <el-alert v-if="error" :title="error" type="error" class="mb-3" :closable="false" show-icon />
      <el-form-item prop="username" :label="$t('user.username')" :rules="[{ required: true, message: () => $t('v.required') }]">
        <el-input v-model="values.username" ref="focus" maxlength="30"></el-input>
      </el-form-item>
      <el-form-item prop="password" :label="$t('user.origPassword')" :rules="[{ required: true, message: () => $t('v.required') }]">
        <el-input v-model="values.password" maxlength="50" show-password></el-input>
      </el-form-item>
      <el-form-item
        prop="plainPassword"
        :label="$t('user.newPassword')"
        :rules="[
          { required: true, message: () => $t('v.required') },
          {
            min: securitySettings.passwordMinLength,
            max: securitySettings.passwordMaxLength,
            message: () => $t('user.error.passwordLength', { min: securitySettings.passwordMinLength, max: securitySettings.passwordMaxLength }),
          },
          { pattern: passwordPattern(securitySettings.passwordStrength), message: () => $t(`user.error.passwordPattern.${securitySettings.passwordStrength}`) },
        ]"
      >
        <el-input v-model="values.plainPassword" :maxlength="securitySettings.passwordMaxLength" show-password></el-input>
      </el-form-item>
      <el-form-item
        prop="passwordAgain"
        :label="$t('user.passwordAgain')"
        :rules="[
          { required: true, message: () => $t('v.required') },
          {
            validator: (rule:any, value:any, callback:any) => {
              if (value !== values.plainPassword) {
                callback($t('user.error.passwordNotMatch'));
              }
              callback();
            },
          },
        ]"
      >
        <el-input v-model="values.passwordAgain" maxlength="50" show-password></el-input>
      </el-form-item>
      <div>
        <el-button :loading="buttonLoading" @click.prevent="handleSubmit" type="primary" native-type="submit">{{ $t('submit') }}</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script lang="ts">
export default { name: 'ChangePassword' };
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { sm2Encrypt } from '@/utils/sm';
import { passwordPattern } from '@/utils/common';
import { securitySettings } from '@/store/useConfig';
import { queryClientPublicKey, changePassword } from '@/api/login';

defineProps({ modelValue: { type: Boolean, required: true } });
const emit = defineEmits({ 'update:modelValue': null });
const { t } = useI18n();
const values = ref<any>({});
const form = ref<any>();
const focus = ref<any>();
const loading = ref<boolean>(false);
const buttonLoading = ref<boolean>(false);
const publicKey = ref<string>('');
const error = ref<string>();

onMounted(async () => {
  loading.value = true;
  try {
    publicKey.value = await queryClientPublicKey();
  } finally {
    loading.value = false;
  }
});

const handleSubmit = () => {
  form.value.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      const password = sm2Encrypt(values.value.password, publicKey.value);
      const data = await changePassword({ ...values.value, password });
      // 登录失败，显示错误信息
      if (data.status !== 0) {
        error.value = data.message;
        return;
      }
      error.value = undefined;
      form.value.resetFields();
      ElMessage.success(t('success'));
      emit('update:modelValue', false);
    } finally {
      buttonLoading.value = false;
    }
  });
};
</script>
