<script setup lang="ts">
import ParameterTreeTable from './ParameterTreeTable.vue';
import type { ProjectEndpointGetRes, Parameter } from '~~/shared/types/project';

// 双向绑定当前 API 详情
const model = defineModel<SerializeObject<ProjectEndpointGetRes>>({ required: true });

// 是否编辑模式（由父级控制）
const props = defineProps<{ edit?: boolean }>();
const isEdit = computed(() => props.edit === true);

const route = useRoute();
const toast = useToast();
const projectId = computed(() => String(route.params.id || ''));

// 深拷贝
const deepClone = <T>(v: T): T =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));

// 编辑草稿：进入编辑模式时，从 model 拷贝一份；保存成功后回写；取消时回滚
const draft = ref<SerializeObject<ProjectEndpointGetRes> | null>(null);

watch(
  () => isEdit.value,
  (val) => {
    if (val && model.value) {
      draft.value = deepClone(model.value);
    }
    if (!val) {
      draft.value = null;
    }
  },
  { immediate: true }
);

// 确保可编辑的数组存在
watchEffect(() => {
  const target = isEdit.value ? draft.value : model.value;
  if (!target) return;
  if (!Array.isArray(target.headers)) (target as any).headers = [] as any;
  if (!Array.isArray(target.queryParams)) (target as any).queryParams = [] as any;
  if (!target.body) (target as any).body = { children: [] } as any;
  if (!Array.isArray(target.body?.children)) (target.body as any).children = [] as any;
  if (Array.isArray(target.response)) {
    for (const r of target.response) {
      if (!r.body) (r as any).body = { children: [] } as any;
      if (!Array.isArray(r.body?.children)) (r.body as any).children = [] as any;
    }
  }
});

// 绑定 v-model 的计算属性包装（始终使用 v-model 传递给 ParameterTreeTable，视模式控制编辑/查看）
const headersParams = computed<Parameter[]>({
  get: () => ((isEdit.value ? draft.value?.headers : model.value?.headers) as any) ?? [],
  set: (v) => {
    const target = isEdit.value ? draft.value : model.value;
    if (target) (target as any).headers = v as any;
  },
});

const queryParams = computed<Parameter[]>({
  get: () => ((isEdit.value ? draft.value?.queryParams : model.value?.queryParams) as any) ?? [],
  set: (v) => {
    const target = isEdit.value ? draft.value : model.value;
    if (target) (target as any).queryParams = v as any;
  },
});

const bodyChildren = computed<Parameter[]>({
  get: () => ((isEdit.value ? draft.value?.body?.children : model.value?.body?.children) as any) ?? [],
  set: (v) => {
    const target = isEdit.value ? draft.value : model.value;
    if (target?.body) (target.body as any).children = v as any;
  },
});

const selectedResp = ref<string | number | undefined>(undefined);
watchEffect(() => {
  const list = (isEdit.value ? draft.value?.response : model.value?.response) ?? [];
  if (list.length > 0 && selectedResp.value == null) selectedResp.value = list[0]!.status as any;
});

const responseChildren = computed<Parameter[]>({
  get: () => {
    const target = isEdit.value ? draft.value : model.value;
    const r = target?.response?.find((x) => String(x.status) === String(selectedResp.value));
    return (r?.body?.children as any) ?? [];
  },
  set: (v) => {
    const target = isEdit.value ? draft.value : model.value;
    const r = target?.response?.find((x) => String(x.status) === String(selectedResp.value));
    if (r?.body) (r.body as any).children = v as any;
  },
});

// 顶部基本信息字段的计算代理
const pathVal = computed<string>({
  get: () => ((isEdit.value ? draft.value?.path : model.value?.path) as any) ?? '',
  set: (v) => {
    const target = isEdit.value ? draft.value : model.value;
    if (target) (target as any).path = v as any;
  },
});

const descVal = computed<string | null>({
  get: () => ((isEdit.value ? draft.value?.description : model.value?.description) as any) ?? null,
  set: (v) => {
    const target = isEdit.value ? draft.value : model.value;
    if (target) (target as any).description = v as any;
  },
});

// 脏标记：比较 draft 与 model 是否有变更
const isDirty = computed(() => {
  if (!isEdit.value) return false;
  if (!draft.value || !model.value) return false;
  try {
    return JSON.stringify(draft.value) !== JSON.stringify(model.value);
  } catch {
    return true;
  }
});

// 保存、取消
const saving = ref(false);
const onCancel = () => {
  if (model.value) draft.value = deepClone(model.value);
  toast.add({ title: '已取消修改', color: 'neutral' });
};

const onSave = async () => {
  if (!isEdit.value || !draft.value || !model.value) return;
  saving.value = true;
  try {
    const res = await http.put<SerializeObject<ProjectEndpointGetRes>>(
      `/api/project/${projectId.value}/endpoint`,
      draft.value as any,
      { query: { endpointId: model.value.id } }
    );

    // 回写 model 并刷新草稿
    model.value = deepClone(res as any);
    draft.value = deepClone(model.value);
    toast.add({ title: '保存成功', color: 'primary' });
  } catch (e) {
    console.error(e);
    toast.add({ title: '保存失败', color: 'error' });
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div v-if="isEdit" class="flex items-center justify-end gap-2">
      <UButton color="neutral" variant="soft" @click="onCancel">取消</UButton>
      <UButton color="primary" :disabled="!isDirty || saving" :loading="saving" @click="onSave">保存</UButton>
    </div>
    <div>
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">基本信息</h3>
      <div v-if="isEdit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">接口路径</label>
          <UInput v-model="pathVal" size="lg" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">接口描述</label>
          <UTextarea v-model="descVal" :rows="3" placeholder="请输入接口描述..." />
        </div>
      </div>
      <div v-else class="bg-muted p-4 rounded-lg">
        <p class="text-sm">
          {{ model.description || '暂无描述' }}
        </p>
      </div>
    </div>

    <div v-if="(model.queryParams?.length || 0) > 0 || isEdit">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">请求参数</h3>
      <ParameterTreeTable v-model:parameters="queryParams" :mode="isEdit ? 'edit' : 'view'" />
    </div>

    <div v-if="(model.headers?.length || 0) > 0 || isEdit">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Headers</h3>
      <ParameterTreeTable v-model:parameters="headersParams" :mode="isEdit ? 'edit' : 'view'" />
    </div>

    <div v-if="model.body || isEdit">
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">Body</h3>
      <ParameterTreeTable v-model:parameters="bodyChildren" :mode="isEdit ? 'edit' : 'view'" />
    </div>

    <div
      v-if="
        Array.isArray(isEdit ? draft?.response : model.response) &&
        (isEdit ? draft?.response?.length || 0 : model.response?.length || 0) > 0
      "
    >
      <h3 class="font-semibold mb-3 pb-2 border-b border-accented">返回数据</h3>
      <UTabs
        v-model="selectedResp"
        :items="(isEdit ? draft!.response! : model.response!).map((r) => ({ label: String(r.status), value: r.status }))"
        variant="link"
      >
        <template #content>
          <ParameterTreeTable v-model:parameters="responseChildren" :mode="isEdit ? 'edit' : 'view'" />
        </template>
      </UTabs>
    </div>
  </div>
</template>
