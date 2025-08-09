export default defineEventHandler(async (event) => {
  const body = await readBody<AdminSettingUpsertReq>(event);

  if (!['allowRegister', 'ldap'].includes(body.key)) {
    throw createError({ statusCode: 400, message: '不支持的配置项' });
  }

  // 简单校验：allowRegister 必须是布尔；ldap 必须是对象
  if (body.key === 'allowRegister' && typeof body.value !== 'boolean') {
    throw createError({ statusCode: 400, message: 'allowRegister 必须为布尔值' });
  }
  if (body.key === 'ldap' && (typeof body.value !== 'object' || body.value === null)) {
    throw createError({ statusCode: 400, message: 'ldap 必须为对象' });
  }

  const row = await prisma.setting.upsert({
    where: { key: body.key },
    update: { value: body.value },
    create: { key: body.key, value: body.value },
  });

  return row as unknown as AdminSettingUpsertRes;
});
