type SettingKey = 'allowRegister' | 'ldap';

interface SettingItem {
  key: SettingKey;
  value: any;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Admin API payloads
type AdminSettingListRes = Array<Pick<SettingItem, 'id' | 'key' | 'value' | 'createdAt' | 'updatedAt'>>;

interface AdminSettingUpsertReq {
  key: SettingKey;
  value: any; // { enabled:boolean, url:string, baseDn: string, ... } or boolean for allowRegister
}

type AdminSettingUpsertRes = Pick<SettingItem, 'id' | 'key' | 'value' | 'createdAt' | 'updatedAt'>;
