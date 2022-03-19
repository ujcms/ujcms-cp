<template>
  <div>
    <div class="mb-3">
      <query-form :params="params" @search="handleSearch" @reset="handleReset">
        <query-item :label="$t('block.name')" name="Q_Contains_name"></query-item>
      </query-form>
    </div>
    <div>
      <el-button type="primary" :disabled="perm('block:create')" :icon="Plus" @click="handleAdd()">{{ $t('add') }}</el-button>
      <el-popconfirm :title="$t('confirmDelete')" @confirm="handleDelete(selection.map((row) => row.id))">
        <template #reference>
          <el-button :disabled="selection.length <= 0 || perm('block:delete')" :icon="Delete">{{ $t('delete') }}</el-button>
        </template>
      </el-popconfirm>
      <list-move :disabled="selection.length <= 0 || filtered || perm('org:update')" @move="(type) => move(selection, type)" class="ml-2" />
      <column-setting name="block" class="ml-2" />
    </div>
    <div class="app-block mt-3">
      <el-table ref="table" v-loading="loading" :data="data" @selection-change="(rows) => (selection = rows)" @row-dblclick="(row) => handleEdit(row.id)" @sort-change="handleSort">
        <column-list name="block">
          <el-table-column type="selection" width="45"></el-table-column>
          <el-table-column property="id" label="ID" width="64" sortable="custom"></el-table-column>
          <el-table-column property="name" :label="$t('block.name')" sortable="custom" show-overflow-tooltip></el-table-column>
          <el-table-column property="alias" :label="$t('block.alias')" sortable="custom" show-overflow-tooltip></el-table-column>
          <el-table-column property="scope" :label="$t('block.scope')" sortable="custom" :formatter="(row) => $t(`block.scope.${row.scope}`)" />
          <el-table-column property="withDescription" :label="$t('block.withDescription')" sortable="custom">
            <template #default="{ row }">
              <el-tag :type="row.withDescription ? 'success' : 'info'" size="small">{{ $t(row.withDescription ? 'yes' : 'no') }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column property="withImage" :label="$t('block.withImage')" sortable="custom">
            <template #default="{ row }">
              <el-tag v-if="!row.withImage" :type="row.withImage ? 'success' : 'info'" size="small">{{ $t(row.withImage ? 'yes' : 'no') }}</el-tag>
              <span v-else class="ml-2">{{ `${row.imageWidth} * ${row.imageHeight}` }}</span>
            </template>
          </el-table-column>
          <el-table-column property="withMobileImage" :label="$t('block.withMobileImage')" sortable="custom" min-width="120" display="none">
            <template #default="{ row }">
              <el-tag v-if="!row.withMobileImage" :type="row.withMobileImage ? 'success' : 'info'" size="small">{{ $t(row.withMobileImage ? 'yes' : 'no') }}</el-tag>
              <span v-else class="ml-2">{{ `${row.mobileImageWidth} * ${row.mobileImageHeight}` }}</span>
            </template>
          </el-table-column>
          <el-table-column property="enabled" :label="$t('block.enabled')" sortable="custom">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'info'" size="small">{{ $t(row.enabled ? 'yes' : 'no') }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('table.action')">
            <template #default="{ row }">
              <el-button type="text" :disabled="perm('block:update')" @click="handleEdit(row.id)" size="small">{{ $t('edit') }}</el-button>
              <el-popconfirm :title="$t('confirmDelete')" @confirm="handleDelete([row.id])">
                <template #reference>
                  <el-button type="text" :disabled="perm('block:delete')" size="small">{{ $t('delete') }}</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </column-list>
      </el-table>
    </div>
    <block-form v-model="formVisible" :beanId="beanId" :beanIds="beanIds" @finished="fetchData" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { perm } from '@/store/useCurrentUser';
import { moveList, toParams, resetParams } from '@/utils/common';
import { deleteBlock, queryBlockList, updateBlockOrder } from '@/api/config';
import { ColumnList, ColumnSetting } from '@/components/TableList';
import { QueryForm, QueryItem } from '@/components/QueryForm';
import ListMove from '@/components/ListMove.vue';
import BlockForm from './BlockForm.vue';

const { t } = useI18n();
const params = ref<any>({});
const sort = ref<any>();
const table = ref<any>();
const data = ref<Array<any>>([]);
const selection = ref<Array<any>>([]);
const loading = ref<boolean>(false);
const formVisible = ref<boolean>(false);
const beanId = ref<number>();
const beanIds = computed(() => data.value.map((row) => row.id));
const filtered = ref<boolean>(false);
const fetchData = async () => {
  loading.value = true;
  try {
    data.value = await queryBlockList({ ...toParams(params.value), Q_OrderBy: sort.value });
    filtered.value = Object.values(params.value).filter((v) => v !== undefined && v !== '').length > 0 || sort.value !== undefined;
  } finally {
    loading.value = false;
  }
};
onMounted(fetchData);

const handleSort = ({ column, prop, order }: { column: any; prop: string; order: string }) => {
  if (prop) {
    sort.value = (column.sortBy ?? prop) + (order === 'descending' ? '_desc' : '');
  } else {
    sort.value = undefined;
  }
  fetchData();
};
const handleSearch = () => fetchData();
const handleReset = () => {
  table.value.clearSort();
  resetParams(params.value);
  sort.value = undefined;
  fetchData();
};

const handleAdd = () => {
  beanId.value = undefined;
  formVisible.value = true;
};
const handleEdit = (id: number) => {
  beanId.value = id;
  formVisible.value = true;
};
const handleDelete = async (ids: number[]) => {
  await deleteBlock(ids);
  fetchData();
  ElMessage.success(t('success'));
};
const move = async (selected: any[], type: 'top' | 'up' | 'down' | 'bottom') => {
  const list = moveList(selected, data.value, type);
  await updateBlockOrder(list.map((item) => item.id));
};
</script>