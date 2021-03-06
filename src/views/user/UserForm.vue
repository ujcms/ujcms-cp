<template>
  <dialog-form
    :name="$t('menu.user.user')"
    :queryBean="queryUser"
    :createBean="createUser"
    :updateBean="updateUser"
    :deleteBean="deleteUser"
    :beanId="beanId"
    :beanIds="beanIds"
    :focus="focus"
    :initValues="(): any => ({orgId:org?.id, gender: 'm', roleIds: [] })"
    :toValues="(bean: any) => ({ ...bean })"
    :disableDelete="(bean: any) => bean.id <= 1"
    :disableEdit="(bean) => currentUser.rank > bean.rank"
    perms="user"
    v-model:values="values"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @finished="$emit('finished')"
    large
  >
    <template #header-status="{ isEdit }">
      <template v-if="isEdit">
        <el-tag v-if="values.status === 0" type="success" class="ml-2">{{ $t(`user.status.${values.status}`) }}</el-tag>
        <el-tag v-else-if="values.status === 1" type="info" class="ml-2">{{ $t(`user.status.${values.status}`) }}</el-tag>
        <el-tag v-else-if="values.status === 2" type="warning" class="ml-2">{{ $t(`user.status.${values.status}`) }}</el-tag>
        <el-tag v-else-if="values.status === 3" type="danger" class="ml-2">{{ $t(`user.status.${values.status}`) }}</el-tag>
        <el-tag v-else type="danger" class="ml-2">{{ values.status }}</el-tag>
      </template>
    </template>
    <template #default="{ bean, isEdit }">
      <el-row>
        <el-col :span="12">
          <el-form-item prop="orgId" :label="$t('user.org')" :rules="{ required: true, message: () => $t('v.required') }">
            <el-tree-select
              v-model="values.orgId"
              :data="orgList"
              nodeKey="id"
              :default-expanded-keys="orgList.map((item) => item.id)"
              :props="{ label: 'name' }"
              :render-after-expand="false"
              check-strictly
              class="w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="groupId" :label="$t('user.group')" :rules="{ required: true, message: () => $t('v.required') }">
            <el-select v-model="values.groupId" class="w-full">
              <el-option v-for="item in groupList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="username"
            :label="$t('user.username')"
            :rules="[
              { required: true, message: () => $t('v.required') },
              {
                asyncValidator: async (rule:any, value:any, callback:any) => {
                  if (value !== bean.username && (await usernameExist(value))) {
                    callback($t('user.error.usernameExist'));
                  }
                  callback();
                },
              },
            ]"
          >
            <el-input v-model="values.username" ref="focus" maxlength="50"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="realName" :label="$t('user.realName')">
            <el-input v-model="values.realName" maxlength="50"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="plainPassword"
            :label="$t('user.plainPassword')"
            :rules="[
              { required: !isEdit, message: () => $t('v.required') },
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
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="passwordAgain"
            :label="$t('user.passwordAgain')"
            :rules="[
              { required: !isEdit, message: () => $t('v.required') },
              {
                validator: (rule:any, value:any, callback:any) => {
                  if (value != values.plainPassword) {
                    callback($t('user.error.passwordNotMatch'));
                  }
                  callback();
                },
                trigger: 'blur',
              },
            ]"
          >
            <el-input v-model="values.passwordAgain" maxlength="50" show-password></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="mobile"
            :label="$t('user.mobile')"
            :rules="[
              {
                asyncValidator: async (rule:any, value:any, callback:any) => {
                  if (value !== bean.mobile && (await mobileExist(value))) {
                    callback($t('user.error.mobileExist'));
                  }
                  callback();
                },
              },
            ]"
          >
            <el-input v-model="values.mobile" maxlength="50"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            prop="email"
            :label="$t('user.email')"
            :rules="[
              {
                asyncValidator: async (rule:any, value:any, callback:any) => {
                  if (value !== bean.email && (await emailExist(value))) {
                    callback($t('user.error.emailExist'));
                  }
                  callback();
                },
              },
            ]"
          >
            <el-input v-model="values.email" maxlength="50"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="gender" :label="$t('user.gender')" :rules="{ required: true, message: () => $t('v.required') }">
            <el-radio-group v-model="values.gender">
              <el-radio :label="'m'">{{ $t('gender.male') }}</el-radio>
              <el-radio :label="'f'">{{ $t('gender.female') }}</el-radio>
              <el-radio :label="'n'">{{ $t('gender.none') }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="birthday" :label="$t('user.birthday')">
            <el-date-picker v-model="values.birthday" type="date"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="location" :label="$t('user.location')">
            <el-input v-model="values.location" maxlength="255"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="bio" :label="$t('user.bio')">
            <el-input v-model="values.bio" type="textarea" :rows="3" maxlength="2000"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="isEdit">
          <el-form-item prop="created" :label="$t('user.created')">
            <template #label><label-tip message="user.created" /></template>
            <el-date-picker v-model="values.created" type="datetime" disabled></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="isEdit">
          <el-form-item prop="loginDate">
            <template #label><label-tip message="user.loginDate" /></template>
            <el-date-picker v-model="values.loginDate" type="datetime" disabled></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="isEdit">
          <el-form-item prop="loginIp">
            <template #label><label-tip message="user.loginIp" /></template>
            <el-input v-model="values.loginIp" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="isEdit">
          <el-form-item prop="loginCount">
            <template #label><label-tip message="user.loginCount" /></template>
            <el-input v-model="values.loginCount" disabled></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
  </dialog-form>
</template>

<script lang="ts">
export default { name: 'UserForm' };
</script>

<script setup lang="ts">
import { onMounted, ref, toRefs, watch } from 'vue';
import { currentUser } from '@/store/useCurrentUser';
import { securitySettings } from '@/store/useConfig';
import { queryUser, createUser, updateUser, deleteUser, usernameExist, emailExist, mobileExist, queryGroupList, queryOrgList } from '@/api/user';
import { toTree } from '@/utils/tree';
import { passwordPattern } from '@/utils/common';
import DialogForm from '@/components/DialogForm.vue';
import LabelTip from '@/components/LabelTip.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  beanId: { required: true },
  beanIds: { type: Array, required: true },
  org: null,
  showGlobalData: { type: Boolean, required: true },
});
const { showGlobalData, modelValue: visible } = toRefs(props);
defineEmits({ 'update:modelValue': null, finished: null });

const focus = ref<any>();
const values = ref<any>({});
const groupList = ref<any[]>([]);
const orgList = ref<any[]>([]);

const fetchGroupList = async () => {
  groupList.value = await queryGroupList({ type: 2 });
};
const fetchOrgList = async () => {
  orgList.value = toTree(await queryOrgList({ current: !showGlobalData.value }));
};

onMounted(() => {
  fetchGroupList();
});

watch(visible, () => {
  if (visible.value) {
    fetchOrgList();
  }
});
</script>
