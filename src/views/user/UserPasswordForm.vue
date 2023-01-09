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
      <el-form-item prop="username" :label="$t('user.username')">
        <el-input :model-value="username" readonly></el-input>
      </el-form-item>
      <el-form-item
        prop="newPassword"
        :label="$t('user.newPassword')"
        :rules="[
          { required: true, message: () => $t('v.required') },
          {
            min: securitySettings.passwordMinLength,
            max: securitySettings.passwordMaxLength,
            message: () => $t('user.error.passwordLength', { min: securitySettings.passwordMinLength, max: securitySettings.passwordMaxLength }),
          },
          { pattern: new RegExp(securitySettings.passwordPattern), message: () => $t(`user.error.passwordPattern.${securitySettings.passwordStrength}`) },
        ]"
      >
        <el-input v-model="values.newPassword" :maxlength="securitySettings.passwordMaxLength" ref="focus" show-password></el-input>
      </el-form-item>
      <el-form-item
        prop="passwordAgain"
        :label="$t('user.passwordAgain')"
        :rules="[
          { required: true, message: () => $t('v.required') },
          {
            validator: (rule:any, value:any, callback:any) => {
              if (value !== values.newPassword) {
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
export default { name: 'UserPasswordForm' };
</script>

<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { sm2Encrypt } from '@/utils/sm';
import { securitySettings } from '@/store/useConfig';
import { queryClientPublicKey } from '@/api/login';
import { updateUserPassword } from '@/api/user';

const props = defineProps({ modelValue: { type: Boolean, required: true }, beanId: { type: Number, default: -1 }, username: { type: String, default: '' } });
const emit = defineEmits({ 'update:modelValue': null });
const { beanId, username } = toRefs(props);
const { t } = useI18n();
const values = ref<any>({});
const form = ref<any>();
const focus = ref<any>();
const loading = ref<boolean>(false);
const buttonLoading = ref<boolean>(false);
const publicKey = ref<string>('');

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
      const newPassword = sm2Encrypt(values.value.newPassword, publicKey.value);
      await updateUserPassword(beanId.value, newPassword);
      form.value.resetFields();
      ElMessage.success(t('success'));
      emit('update:modelValue', false);
    } finally {
      buttonLoading.value = false;
    }
  });
};
</script>