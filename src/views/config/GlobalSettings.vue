<template>
  <el-container>
    <el-aside width="180px" class="pr-3">
      <el-tabs v-model="type" @tab-click="({ paneName }) => tabClick(paneName)" tab-position="left" stretch class="bg-white">
        <el-tab-pane v-for="tp in types" :key="tp" :name="tp" :label="$t(`config.settings.${tp}`)"></el-tab-pane>
      </el-tabs>
    </el-aside>
    <el-main class="p-3 app-block">
      <el-form ref="form" :model="values" v-loading="loading" label-width="160px">
        <template v-if="type === 'upload'">
          <el-row>
            <el-col :span="12">
              <el-form-item prop="imageTypes" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.imageTypes" help /></template>
                <el-input v-model="values.imageTypes" maxlength="255"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="imageLimit" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.imageLimit" help /></template>
                <el-input-number v-model="values.imageLimit" :min="0" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="videoTypes" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.videoTypes" help /></template>
                <el-input v-model="values.videoTypes" maxlength="255"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="videoLimit" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.videoLimit" help /></template>
                <el-input-number v-model="values.videoLimit" :min="0" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="audioTypes" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.audioTypes" help /></template>
                <el-input v-model="values.audioTypes" maxlength="255"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="audioLimit" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.audioLimit" help /></template>
                <el-input-number v-model="values.audioLimit" :min="0" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="libraryTypes" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.libraryTypes" help /></template>
                <el-input v-model="values.libraryTypes" maxlength="255"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="libraryLimit" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.libraryLimit" help /></template>
                <el-input-number v-model="values.libraryLimit" :min="0" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="docTypes" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.docTypes" help /></template>
                <el-input v-model="values.docTypes" maxlength="255"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="docLimit" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.docLimit" help /></template>
                <el-input-number v-model="values.docLimit" :min="0" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="fileTypes" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.fileTypes" help /></template>
                <el-input v-model="values.fileTypes" maxlength="255"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="fileLimit" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.fileLimit" help /></template>
                <el-input-number v-model="values.fileLimit" :min="0" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="imageMaxWidth" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.imageMaxWidth" help /></template>
                <el-input-number v-model="values.imageMaxWidth" :min="0" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="imageMaxHeight" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.upload.imageMaxHeight" help /></template>
                <el-input-number v-model="values.imageMaxHeight" :min="0" :max="65535"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <template v-else-if="type === 'security' && currentUser.epRank < 1">
          <el-alert type="warning" :closable="false" :show-icon="true">
            <template #title><span v-html="$t('error.enterprise')"></span></template>
          </el-alert>
        </template>
        <template v-else-if="type === 'security' && currentUser.epRank >= 1">
          <el-row>
            <el-col :span="24">
              <el-form-item prop="passwordStrength">
                <template #label><label-tip message="config.security.passwordStrength" /></template>
                <el-select v-model="values.passwordStrength" class="w-full">
                  <el-option v-for="n in [0, 1, 2, 3, 4]" :key="n" :value="n" :label="$t(`config.security.passwordStrength.${n}`)" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="passwordMinLength">
                <template #label><label-tip message="config.security.passwordMinLength" help /></template>
                <el-input-number v-model="values.passwordMinLength" :min="0" :max="16" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="passwordMaxLength">
                <template #label><label-tip message="config.security.passwordMaxLength" help /></template>
                <el-input-number v-model="values.passwordMaxLength" :min="16" :max="128" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="userMaxAttempts">
                <template #label><label-tip message="config.security.userMaxAttempts" help /></template>
                <el-input-number v-model="values.userMaxAttempts" :min="0" :max="100" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="userLockMinutes">
                <template #label><label-tip message="config.security.userLockMinutes" help /></template>
                <el-input-number v-model="values.userLockMinutes" :min="1" :max="1440" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="ipCaptchaAttempts">
                <template #label><label-tip message="config.security.ipCaptchaAttempts" help /></template>
                <el-input-number v-model="values.ipCaptchaAttempts" :min="0" :max="100" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="ipMaxAttempts">
                <template #label><label-tip message="config.security.ipMaxAttempts" help /></template>
                <el-input-number v-model="values.ipMaxAttempts" :min="0" :max="999" />
              </el-form-item>
            </el-col>
            <template v-if="currentUser.epRank >= 2 || currentUser.epDisplay">
              <el-divider content-position="left"></el-divider>
              <el-col :span="12">
                <el-form-item prop="passwordMinDays">
                  <template #label><label-tip message="config.security.passwordMinDays" help /></template>
                  <el-input-number v-model="values.passwordMinDays" :min="0" :max="998" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="passwordMaxDays">
                  <template #label><label-tip message="config.security.passwordMaxDays" help /></template>
                  <el-input-number v-model="values.passwordMaxDays" :min="0" :max="999" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="passwordWarnDays">
                  <template #label><label-tip message="config.security.passwordWarnDays" help /></template>
                  <el-input-number v-model="values.passwordWarnDays" :min="0" :max="90" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="passwordMaxHistory">
                  <template #label><label-tip message="config.security.passwordMaxHistory" help /></template>
                  <el-input-number v-model="values.passwordMaxHistory" :min="0" :max="24" />
                </el-form-item>
              </el-col>
            </template>
            <template v-if="currentUser.epRank >= 3 || currentUser.epDisplay">
              <el-divider content-position="left"></el-divider>
              <el-col :span="12">
                <el-form-item prop="twoFactor">
                  <template #label><label-tip message="config.security.twoFactor" help /></template>
                  <el-switch v-model="values.twoFactor" :disabled="currentUser.epRank < 3" />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </template>
        <template v-else-if="type === 'sms'">
          <el-row>
            <el-col :span="12">
              <el-form-item prop="provider" :rules="{ required: true, message: () => $t('v.required') }">
                <template #label><label-tip message="config.sms.provider" /></template>
                <el-radio-group v-model="values.provider">
                  <el-radio-button v-for="n in [0, 1, 2]" :key="n" :label="n">{{ $t(`config.sms.provider.${n}`) }}</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <template v-if="values.provider !== 0">
              <el-col :span="12">
                <el-form-item prop="maxPerIp">
                  <template #label><label-tip message="config.sms.maxPerIp" /></template>
                  <el-input-number v-model="values.maxPerIp" :min="1" :max="99999" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="codeLength">
                  <template #label><label-tip message="config.sms.codeLength" /></template>
                  <el-input-number v-model="values.codeLength" :min="4" :max="6" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="codeExpires">
                  <template #label><label-tip message="config.sms.codeExpires" help /></template>
                  <el-input-number v-model="values.codeExpires" :min="3" :max="30" />
                </el-form-item>
              </el-col>
              <template v-if="values.provider === 1">
                <el-col :span="12">
                  <el-form-item prop="accessKeyId" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.accessKeyId" /></template>
                    <el-input v-model="values.accessKeyId" maxlength="128" show-password></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="accessKeySecret" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.accessKeySecret" /></template>
                    <el-input v-model="values.accessKeySecret" maxlength="128" show-password></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="templateCode" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.templateCode" /></template>
                    <el-input v-model="values.templateCode" maxlength="32"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="codeName" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.codeName" /></template>
                    <el-input v-model="values.codeName" maxlength="20"></el-input>
                  </el-form-item>
                </el-col>
              </template>
              <template v-else-if="values.provider === 2">
                <el-col :span="12">
                  <el-form-item prop="secretId" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.secretId" /></template>
                    <el-input v-model="values.secretId" maxlength="128" show-password></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="secretKey" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.secretKey" /></template>
                    <el-input v-model="values.secretKey" maxlength="128" show-password></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="templateId" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.templateId" /></template>
                    <el-input v-model="values.templateId" maxlength="32"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="sdkAppId" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.sdkAppId" /></template>
                    <el-input v-model="values.sdkAppId" maxlength="64"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="region" :rules="{ required: true, message: () => $t('v.required') }">
                    <template #label><label-tip message="config.sms.region" help /></template>
                    <el-input v-model="values.region" maxlength="64"></el-input>
                  </el-form-item>
                </el-col>
              </template>
              <el-col :span="12">
                <el-form-item prop="signName" :rules="{ required: true, message: () => $t('v.required') }">
                  <template #label><label-tip message="config.sms.signName" help /></template>
                  <el-input v-model="values.signName" maxlength="50"></el-input>
                </el-form-item>
              </el-col>
              <el-divider content-position="left">{{ $t('config.sms.test') }}</el-divider>
              <el-col :span="12">
                <el-form-item prop="testMobile">
                  <template #label><label-tip message="config.sms.testMobile" /></template>
                  <el-input v-model="values.testMobile" maxlength="30"></el-input>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </template>
        <template v-else-if="type === 'uploadStorage' || type === 'htmlStorage' || type === 'templateStorage'">
          <el-row>
            <el-col :span="24">
              <el-form-item
                prop="type"
                :rules="[
                  { required: true, message: () => $t('v.required') },
                  {
                    validator: (rule, value, callback) => {
                      if (value === 1 && currentUser.epRank < 1) {
                        callback($t('error.enterprise.short'));
                      }
                      callback();
                    },
                  },
                ]"
              >
                <template #label><label-tip message="config.storage.type" /></template>
                <el-select v-model="values.type" class="w-full">
                  <el-option
                    v-for="n in [0, 1].filter((item) => item !== 1 || currentUser.epRank > 0 || currentUser.epDisplay)"
                    :key="n"
                    :value="n"
                    :label="$t(`config.storage.type.${n}`)"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="path" :rules="{ pattern: /^(?!.*\.\.).*$/, message: () => $t('v.url') }">
                <template #label><label-tip message="config.storage.path" /></template>
                <el-input v-model="values.path" maxlength="160"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="url" :rules="{ pattern: /^(?!.*\.\.).*$/, message: () => $t('v.url') }">
                <template #label><label-tip message="config.storage.url" /></template>
                <el-input v-model="values.url" maxlength="160"></el-input>
              </el-form-item>
            </el-col>
            <template v-if="values.type === 1">
              <el-col :span="24">
                <el-form-item prop="endpoint" :rules="{ required: true, message: () => $t('v.required') }">
                  <template #label><label-tip message="config.storage.endpoint" /></template>
                  <el-input v-model="values.endpoint" maxlength="160" :disabled="currentUser.epRank < 1"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="region" :rules="{ required: true, message: () => $t('v.required') }">
                  <template #label><label-tip message="config.storage.region" /></template>
                  <el-input v-model="values.region" maxlength="160" :disabled="currentUser.epRank < 1"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="bucket" :rules="{ required: true, message: () => $t('v.required') }">
                  <template #label><label-tip message="config.storage.bucket" /></template>
                  <el-input v-model="values.bucket" maxlength="160" :disabled="currentUser.epRank < 1"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="accessKey" :rules="{ required: true, message: () => $t('v.required') }">
                  <template #label><label-tip message="config.storage.accessKey" /></template>
                  <el-input v-model="values.accessKey" type="password" show-password maxlength="160" :disabled="currentUser.epRank < 1"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="secretKey" :rules="{ required: true, message: () => $t('v.required') }">
                  <template #label><label-tip message="config.storage.secretKey" /></template>
                  <el-input v-model="values.secretKey" type="password" show-password maxlength="160" :disabled="currentUser.epRank < 1"></el-input>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </template>
        <template v-else-if="type === 'customs'">
          <el-row>
            <el-col v-for="field in fields" :key="field.code" :span="field.double ? 12 : 24">
              <el-form-item :prop="field.code" :rules="field.required ? { required: true, message: () => $t('v.required') } : undefined">
                <template #label><label-tip :label="field.name" /></template>
                <field-item :field="field" v-model="values[field.code]"></field-item>
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <template v-else>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="port" :rules="{ type: 'number', min: 0, max: 65535, message: () => $t('v.range', { min: 0, max: 65535 }) }">
                <template #label><label-tip message="config.port" help /></template>
                <el-input v-model.number="values.port"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="contextPath">
                <template #label><label-tip message="config.contextPath" help /></template>
                <el-input v-model="values.contextPath" maxlength="50"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="channelUrl" :rules="{ pattern: /^\/[\w-]+$/, message: () => $t('config.error.channelUrlPattern') }">
                <template #label><label-tip message="config.channelUrl" help /></template>
                <el-input v-model="values.channelUrl" maxlength="50"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="articleUrl">
                <template #label><label-tip message="config.articleUrl" help /></template>
                <el-input v-model="values.articleUrl" maxlength="50"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="defaultSiteId" :label="$t('config.defaultSite')">
                <el-tree-select
                  v-model="values.defaultSiteId"
                  :data="siteList"
                  nodeKey="id"
                  :props="{ label: 'name' }"
                  class="w-full"
                  :render-after-expand="false"
                  check-strictly
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="multiDomain">
                <template #label><label-tip message="config.multiDomain" help /></template>
                <el-switch v-model="values.multiDomain" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <div v-if="type !== 'security' || currentUser.epRank > 1" v-loading="buttonLoading">
          <el-button :disabled="perm(`config:${type}:update`)" @click.prevent="handleSubmit()" type="primary" native-type="submit">
            {{ $t('save') }}
          </el-button>
          <el-button v-if="type === 'sms' && values.provider !== 0" :disabled="perm(`config:sms:update`) || !values.testMobile?.trim()" @click="handleSendTestSms()">
            {{ $t('config.sms.op.testSend') }}
          </el-button>
        </div>
      </el-form>
    </el-main>
  </el-container>
</template>

<script lang="ts">
export default { name: 'GlobalSettings' };
</script>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { toTree } from '@/utils/tree';
import { querySiteList } from '@/api/system';
import {
  queryConfigModel,
  queryConfig,
  queryConfigSms,
  queryUploadStorage,
  queryHtmlStorage,
  queryTemplateStorage,
  updateConfigBase,
  updateConfigCustoms,
  updateConfigUpload,
  updateConfigSecurity,
  updateConfigSms,
  sendTestSms,
  updateUploadStorage,
  updateHtmlStorage,
  updateTemplateStorage,
} from '@/api/config';
import { perm, hasPermission, currentUser } from '@/store/useCurrentUser';
import { initConfig } from '@/store/useConfig';
import LabelTip from '@/components/LabelTip.vue';
import FieldItem from '@/views/config/components/FieldItem.vue';

const { t } = useI18n();
const form = ref<any>();
const config = ref<any>({});
const values = ref<any>({});
const loading = ref<boolean>(false);
const buttonLoading = ref<boolean>(false);
const siteList = ref<any[]>([]);
const model = ref<any>();
const fields = computed(() => JSON.parse(model.value?.customs || '[]'));

const types: string[] = [];
if (hasPermission('config:base:update')) types.push('base');
if (hasPermission('config:upload:update')) types.push('upload');
if (hasPermission('config:security:update') && (currentUser.epRank >= 1 || currentUser.epDisplay)) types.push('security');
if (hasPermission('config:sms:update')) types.push('sms');
if (hasPermission('config:uploadStorage:update')) types.push('uploadStorage');
if (hasPermission('config:htmlStorage:update')) types.push('htmlStorage');
if (hasPermission('config:templateStorage:update')) types.push('templateStorage');
if (hasPermission('config:customs:update')) types.push('customs');
const type = ref<string>(types[0]);

const tabClick = async (paneName?: string | number) => {
  if (paneName === 'upload') {
    values.value = config.value.upload;
  } else if (paneName === 'security') {
    values.value = config.value.security;
  } else if (paneName === 'customs') {
    values.value = config.value.customs;
  } else if (paneName === 'sms') {
    values.value = await queryConfigSms();
  } else if (paneName === 'uploadStorage') {
    values.value = await queryUploadStorage();
  } else if (paneName === 'htmlStorage') {
    values.value = await queryHtmlStorage();
  } else if (paneName === 'templateStorage') {
    values.value = await queryTemplateStorage();
  } else {
    values.value = config.value;
  }
};

const fetchConfigModel = async () => {
  model.value = await queryConfigModel();
};
const fetchConfig = async () => {
  config.value = await queryConfig();
  tabClick(type.value);
};
const fetchSiteList = async () => {
  siteList.value = toTree(await querySiteList());
};
onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([fetchConfig(), fetchConfigModel(), fetchSiteList()]);
  } finally {
    loading.value = false;
  }
});
const load = async () => {
  loading.value = true;
  try {
    await fetchConfig();
  } finally {
    loading.value = false;
  }
};
const handleSubmit = () => {
  form.value.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (type.value === 'upload') {
        await updateConfigUpload(values.value);
      } else if (type.value === 'security') {
        await updateConfigSecurity(values.value);
      } else if (type.value === 'customs') {
        await updateConfigCustoms(values.value);
      } else if (type.value === 'sms') {
        await updateConfigSms(values.value);
      } else if (type.value === 'uploadStorage') {
        await updateUploadStorage(values.value);
      } else if (type.value === 'htmlStorage') {
        await updateHtmlStorage(values.value);
      } else if (type.value === 'templateStorage') {
        await updateTemplateStorage(values.value);
      } else {
        await updateConfigBase(values.value);
      }
      initConfig();
      ElMessage.success(t('success'));
    } finally {
      buttonLoading.value = false;
    }
    load();
  });
};
const handleSendTestSms = () => {
  form.value.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      const { status, message } = await sendTestSms(values.value);
      if (status === -1) {
        ElMessageBox.alert(message);
      } else {
        ElMessage.success(t('success'));
      }
    } finally {
      buttonLoading.value = false;
    }
    load();
  });
};
</script>

<style lang="scss" scoped>
.el-tabs {
  :deep(.el-tabs__header) {
    float: right;
    margin-right: 1px;
  }
}
</style>
