<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="!unsaved"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @opened="!isEdit && focus?.focus()"
    :width="large ? '98%' : '768px'"
    :top="large ? '16px' : '8vh'"
  >
    <div v-loading="loading || buttonLoading">
      <el-button v-if="isEdit && addable" :disabled="perm(`${perms}:create`)" type="primary" :icon="Plus" @click="handleAdd">{{ $t('add') }}</el-button>
      <slot name="header-action" :bean="bean" :isEdit="isEdit" :disabled="disabled" :unsaved="unsaved" :disableDelete="disableDelete" :handleDelete="handleDelete">
        <el-popconfirm v-if="isEdit" :title="$t('confirmDelete')" @confirm="handleDelete()">
          <template #reference>
            <el-button :disabled="disableDelete?.(bean) || perm(`${perms}:delete`)" :icon="Delete">{{ $t('delete') }}</el-button>
          </template>
        </el-popconfirm>
      </slot>
      <el-button-group class="ml-2">
        <el-button v-if="isEdit" @click="handlePrev" :disabled="!hasPrev">{{ $t('form.prev') }}</el-button>
        <el-button v-if="isEdit" @click="handleNext" :disabled="!hasNext">{{ $t('form.next') }}</el-button>
      </el-button-group>
      <el-button @click="handleCancel" type="primary" class="ml-2">{{ $t('back') }}</el-button>
      <el-tooltip :content="$t('form.continuous')" placement="top">
        <el-switch v-model="continuous" size="small" class="ml-2"></el-switch>
      </el-tooltip>
      <el-tag v-if="unsaved" type="danger" class="ml-2">{{ $t('form.unsaved') }}</el-tag>
      <slot name="header-status" :bean="bean" :isEdit="isEdit" :disabled="disabled"></slot>
    </div>
    <el-form :class="['mt-5', 'pr-5']" ref="form" :model="values" :disabled="disabled" :label-width="labelWidth ?? '150px'" :label-position="labelPosition ?? 'right'">
      <slot :bean="bean" :isEdit="isEdit" :disabled="disabled"></slot>
      <div v-if="!disabled" v-loading="buttonLoading">
        <slot name="footer-action" :bean="bean" :isEdit="isEdit" :disabled="disabled" :handleSubmit="handleSubmit">
          <el-button :disabled="perm(isEdit ? `${perms}:update` : `${perms}:create`)" @click.prevent="handleSubmit()" type="primary" native-type="submit">
            {{ $t('save') }}
          </el-button>
        </slot>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, toRefs, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import _ from 'lodash';
import { perm } from '@/store/useCurrentUser';

const CONTINUOUS_SETTINGS = 'ujcms_continuous_settings';
function fetchContinuous(): Record<string, boolean> {
  const settings = localStorage.getItem(CONTINUOUS_SETTINGS);
  return settings ? JSON.parse(settings) : {};
}
function storeContinuous(settings: Record<string, boolean>) {
  localStorage.setItem(CONTINUOUS_SETTINGS, JSON.stringify(settings));
}
function getContinuous(name: string) {
  const settings = fetchContinuous();
  return settings[name] ?? false;
}
function setContinuous(name: string, continuous: boolean) {
  const settings = fetchContinuous();
  settings[name] = continuous;
  storeContinuous(settings);
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  name: { type: String, required: true },
  beanId: { required: true },
  beanIds: { type: Array, required: true },
  values: { type: Object, required: true },
  initValues: { type: Function as PropType<(bean?: any) => any>, required: true },
  toValues: { type: Function as PropType<(bean: any) => any>, required: true },
  queryBean: { type: Function as PropType<(id: any) => Promise<any>>, required: true },
  createBean: { type: Function as PropType<(bean: any) => Promise<any>>, required: true },
  updateBean: { type: Function as PropType<(bean: any) => Promise<any>>, required: true },
  deleteBean: { type: Function as PropType<(ids: any[]) => Promise<any>>, required: true },
  disableDelete: { type: Function as PropType<(bean: any) => boolean> },
  disableEdit: { type: Function as PropType<(bean: any) => boolean> },
  addable: { type: Boolean, default: true },
  perms: String,
  focus: Object,
  large: Boolean,
  labelPosition: String as PropType<'top' | 'right' | 'left'>,
  labelWidth: String,
});
const emit = defineEmits({
  'update:modelValue': null,
  'update:values': null,
  finished: null,
  beanChange: null,
  beforeSubmit: null,
});

const { name, beanId, beanIds, focus, values, disableEdit, modelValue: visible } = toRefs(props);
const { t } = useI18n();
const loading = ref<boolean>(false);
const buttonLoading = ref<boolean>(false);
const continuous = ref<boolean>(getContinuous(name.value));
const form = ref<any>();
const bean = ref<any>(props.initValues());
const origValues = ref<any>();
const id = ref<any>();
const ids = ref<Array<any>>([]);
const isEdit = computed(() => id.value != null);
const unsaved = computed(() => {
  // 调试 未保存
  // if (!_.isEqual(origValues.value, values.value)) {
  //   console.log(JSON.stringify(origValues.value));
  //   console.log(JSON.stringify(values.value));
  // }
  return !loading.value && !_.isEqual(origValues.value, values.value);
});
const disabled = computed(() => disableEdit?.value?.(bean.value) ?? false);
const title = computed(() => `${name.value} - ${isEdit.value ? `${t(disabled ? 'detail' : 'edit')} (ID: ${id.value})` : `${t('add')}`}`);
const loadBean = async () => {
  loading.value = true;
  try {
    bean.value = id.value != null ? await props.queryBean(id.value) : props.initValues(values.value);
    origValues.value = id.value != null ? props.toValues(bean.value) : bean.value;
    emit('update:values', { ...origValues.value });
    emit('beanChange', bean.value);
    form.value?.resetFields();
  } finally {
    loading.value = false;
  }
};
onMounted(() => emit('update:values', props.initValues()));
watch(visible, () => {
  if (visible.value) {
    ids.value = beanIds.value;
    if (id.value !== beanId.value) {
      id.value = beanId.value;
    } else {
      loadBean();
    }
  }
});
watch(id, () => {
  loadBean();
});
watch(continuous, () => setContinuous(name.value, continuous.value));
const index = computed(() => ids.value.indexOf(id.value));
const hasPrev = computed(() => index.value > 0);
const hasNext = computed(() => index.value < ids.value.length - 1);
const handlePrev = () => {
  if (hasPrev.value) {
    id.value = ids.value[index.value - 1];
  }
};
const handleNext = () => {
  if (hasNext.value) {
    id.value = ids.value[index.value + 1];
  }
};
const handleAdd = () => {
  // eslint-disable-next-line no-unused-expressions
  focus?.value?.focus?.();
  id.value = undefined;
};
const handleCancel = () => {
  emit('update:modelValue', false);
};
const handleSubmit = () => {
  form.value.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      emit('beforeSubmit', values.value);
      if (isEdit.value) {
        await props.updateBean(values.value);
      } else {
        await props.createBean(values.value);
        // eslint-disable-next-line no-unused-expressions
        focus?.value?.focus?.();
        emit('update:values', props.initValues(values.value));
        form.value.resetFields();
      }
      ElMessage.success(t('success'));
      if (!continuous.value) emit('update:modelValue', false);
      emit('finished', bean.value);
    } finally {
      buttonLoading.value = false;
    }
  });
};
const handleDelete = async () => {
  buttonLoading.value = true;
  try {
    await props.deleteBean([id.value]);
    if (!continuous.value) emit('update:modelValue', false);
    if (hasNext.value) {
      handleNext();
      ids.value.splice(index.value - 1, 1);
    } else if (hasPrev.value) {
      handlePrev();
      ids.value.splice(index.value + 1, 1);
    } else {
      emit('update:modelValue', false);
    }
    ElMessage.success(t('success'));
    emit('finished');
  } finally {
    buttonLoading.value = false;
  }
};
const submit = (
  executor: (values: any, payload: { isEdit: boolean; continuous: boolean; form: any; props: any; focus: any; loadBean: () => Promise<any>; emit: any }) => Promise<any>,
) => {
  form.value.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      emit('beforeSubmit', values.value);

      await executor(values.value, { isEdit: isEdit.value, continuous: continuous.value, form: form.value, props: props, focus: focus?.value, loadBean, emit });

      if (!continuous.value) emit('update:modelValue', false);
      emit('finished', bean.value);
    } finally {
      buttonLoading.value = false;
    }
  });
};
const remove = async (
  executor: (values: any, payload: { isEdit: boolean; continuous: boolean; form: any; props: any; focus: any; loadBean: () => Promise<any>; emit: any }) => Promise<any>,
) => {
  buttonLoading.value = true;
  try {
    await executor(values.value, { isEdit: isEdit.value, continuous: continuous.value, form: form.value, props: props, focus: focus?.value, loadBean, emit });
    if (!continuous.value) emit('update:modelValue', false);
    if (hasNext.value) {
      handleNext();
      ids.value.splice(index.value - 1, 1);
    } else if (hasPrev.value) {
      handlePrev();
      ids.value.splice(index.value + 1, 1);
    } else {
      emit('update:modelValue', false);
    }
    ElMessage.success(t('success'));
    emit('finished');
  } finally {
    buttonLoading.value = false;
  }
};
defineExpose({ form, submit, remove });
</script>
