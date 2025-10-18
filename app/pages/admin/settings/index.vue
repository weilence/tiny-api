<template>
  <div class="max-w-7xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-semibold">系统设置</h1>

    <UCard>
      <template #header>
        <div class="font-medium">注册</div>
      </template>
      <UForm id="form-allow" class="space-y-2" :schema="allowSchema" :state="allowState" @submit="onSaveAllow">
        <UFormField label="允许新用户注册" name="allowRegister">
          <UCheckbox v-model="allowState.allowRegister" />
        </UFormField>
        <UButton color="primary" :loading="savingAllow" type="submit" form="form-allow">保存</UButton>
      </UForm>
    </UCard>

    <UCard>
      <template #header>
        <div class="font-medium">LDAP 配置</div>
      </template>
      <UForm id="form-ldap" class="space-y-2" :schema="ldapSchema" :state="ldapState" @submit="onSaveLdap">
        <UFormField label="启用 LDAP" name="enabled">
          <USwitch v-model="ldapState.enabled" />
        </UFormField>
        <UFormField label="URL" name="url" required>
          <UInput v-model="ldapState.url" placeholder="ldap://127.0.0.1:389" class="w-full" />
        </UFormField>
        <UFormField label="Admin DN" name="adminDn">
          <UInput v-model="ldapState.adminDn" placeholder="cn=admin,dc=example,dc=org" class="w-full" />
        </UFormField>
        <UFormField label="Admin Password" name="adminPassword">
          <UInput v-model="ldapState.adminPassword" type="password" class="w-full" />
        </UFormField>
        <UFormField label="Base DN" name="baseDn">
          <UInput v-model="ldapState.baseDn" placeholder="dc=example,dc=org" class="w-full" />
        </UFormField>
        <UFormField label="用户名属性" name="usernameAttr">
          <UInput v-model="ldapState.usernameAttr" placeholder="sAMAccountName" class="w-full" />
        </UFormField>
        <UFormField label="姓名属性" name="nameAttr">
          <UInput v-model="ldapState.nameAttr" placeholder="cn" class="w-full" />
        </UFormField>
        <UFormField label="邮箱属性" name="emailAttr">
          <UInput v-model="ldapState.emailAttr" placeholder="mail" class="w-full" />
        </UFormField>
        <UFormField label="TLS 严格验证" name="tlsRejectUnauthorized">
          <USwitch v-model="ldapState.tlsRejectUnauthorized" />
        </UFormField>
        <UFormField label="连接超时 (ms)" name="timeoutMs">
          <UInput v-model.number="ldapState.timeoutMs" type="number" class="w-full" />
        </UFormField>
        <UButton color="primary" :loading="savingLdap" type="submit" form="form-ldap">保存</UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as v from 'valibot';

const toast = useToast();
const { refreshSettings } = useSettings();
const savingAllow = ref(false);
const savingLdap = ref(false);

// Valibot schemas
const allowSchema = v.object({
  allowRegister: v.boolean(),
});
type AllowSchema = v.InferOutput<typeof allowSchema>;

const ldapSchema = v.object({
  enabled: v.boolean(),
  url: v.pipe(v.string(), v.nonEmpty('必填')),
  baseDn: v.string(),
  adminDn: v.string(),
  adminPassword: v.string(),
  usernameAttr: v.string(),
  nameAttr: v.string(),
  emailAttr: v.string(),
  tlsRejectUnauthorized: v.boolean(),
  timeoutMs: v.number(),
});
type LdapSchema = v.InferOutput<typeof ldapSchema>;

// Reactive states
const allowState = reactive<AllowSchema>({
  allowRegister: false,
});

const ldapState = reactive<LdapSchema>({
  enabled: false,
  url: '',
  baseDn: '',
  adminDn: '',
  adminPassword: '',
  usernameAttr: '',
  nameAttr: '',
  emailAttr: '',
  tlsRejectUnauthorized: true,
  timeoutMs: 5000,
});

onMounted(async () => {
  const list = await http.get('/api/admin/settings');
  const map = Object.fromEntries(list.map((s: any) => [s.key, s.value]));
  if (typeof map.allowRegister === 'boolean') allowState.allowRegister = map.allowRegister;
  if (typeof map.ldap === 'object' && map.ldap) Object.assign(ldapState, map.ldap);
});

async function onSaveAllow(event: FormSubmitEvent<AllowSchema>) {
  savingAllow.value = true;
  try {
    await http.post('/api/admin/settings', { key: 'allowRegister', value: event.data.allowRegister });
    toast.add({ title: '已保存', color: 'success' });
  } finally {
    savingAllow.value = false;
  }

  await refreshSettings();
}

async function onSaveLdap(event: FormSubmitEvent<LdapSchema>) {
  savingLdap.value = true;
  try {
    await http.post('/api/admin/settings', { key: 'ldap', value: event.data });
    toast.add({ title: '已保存', color: 'success' });
  } finally {
    savingLdap.value = false;
  }
}

definePageMeta({ layout: 'default', title: '系统设置' });
</script>
