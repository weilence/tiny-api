<script setup lang="ts">
interface Props {
  parameter: PrismaJson.Parameter;
  level?: number;
  parentPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  parentPath: '',
});

// Function to generate unique node ID
const getNodeId = (param: PrismaJson.Parameter, parentPath: string = '') => {
  return parentPath ? `${parentPath}.${param.key}` : param.key;
};

// Function to get type display text
const getTypeDisplay = (param: PrismaJson.Parameter) => {
  let typeText = param.type;
  if (param.isArray) {
    typeText += '[]';
  }
  return typeText;
};

// State for tracking expanded/collapsed nodes (shared across all instances)
const expandedNodes = useState<Set<string>>('expandedNodes', () => new Set());

// Function to toggle node expansion
const toggleNode = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId);
  } else {
    expandedNodes.value.add(nodeId);
  }
};

// Function to check if node is expanded
const isExpanded = (nodeId: string) => {
  return expandedNodes.value.has(nodeId);
};

const nodeId = getNodeId(props.parameter, props.parentPath);
const hasChildren = computed(() => props.parameter.children && props.parameter.children.length > 0);
const text: string[] = [];
if (props.parameter.options) {
  text.push(`枚举值: ${props.parameter.options.join(', ')}`);
}
if (props.parameter.description) {
  text.push(props.parameter.description);
}
const description = text.length > 0 ? text.join('\b') : '';

// Auto-expand nodes with children on mount
onMounted(() => {
  if (hasChildren.value) {
    expandedNodes.value.add(nodeId);

    // Recursively expand all children
    const expandAllChildren = (param: PrismaJson.Parameter, parentPath: string = '') => {
      if (param.children) {
        param.children.forEach((child) => {
          const childNodeId = getNodeId(child, parentPath ? `${parentPath}.${param.key}` : param.key);
          if (child.children && child.children.length > 0) {
            expandedNodes.value.add(childNodeId);
            expandAllChildren(child, parentPath ? `${parentPath}.${param.key}` : param.key);
          }
        });
      }
    };

    expandAllChildren(props.parameter, props.parentPath);
  }
});
</script>

<template>
  <div>
    <!-- Parameter row -->
    <div
      class="flex items-center border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      :class="{ 'cursor-pointer': hasChildren }"
      @click="hasChildren ? toggleNode(nodeId) : null"
    >
      <!-- Combined indentation and parameter name area -->
      <div class="py-3 px-4 w-64 flex items-center" :style="{ paddingLeft: level * 16 + 16 + 'px' }">
        <div v-if="hasChildren" class="flex items-center justify-center w-4 h-4 mr-2 text-gray-400 flex-shrink-0">
          <UIcon
            :name="isExpanded(nodeId) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
            class="w-3 h-3"
          />
        </div>
        <div v-else class="w-6 flex-shrink-0" />

        <!-- Parameter name -->
        <div class="flex-1 min-w-0">
          <UTooltip
            v-if="parameter.key && parameter.key !== 'root'"
            :text="parameter.key"
            :popper="{ placement: 'top' }"
          >
            <span class="text-sm font-mono text-blue-600 dark:text-blue-400 block truncate">
              {{ parameter.key }}
            </span>
          </UTooltip>
          <span v-else class="text-sm font-mono text-blue-600 dark:text-blue-400">
            {{ parameter.key || 'root' }}
          </span>
        </div>
      </div>

      <!-- Type -->
      <div class="py-3 px-4 w-32">
        <span class="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {{ getTypeDisplay(parameter) }}
        </span>
      </div>

      <!-- Required -->
      <div class="py-3 px-4 w-30 space-x-1">
        <UBadge :color="parameter.required ? 'error' : 'neutral'" variant="soft" size="sm">
          {{ parameter.required ? '必填' : '可选' }}
        </UBadge>
        <UBadge v-if="parameter.options" color="primary" variant="soft" size="sm"> 枚举 </UBadge>
      </div>

      <!-- Value -->
      <div class="py-3 px-4 w-40">
        <span class="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
          {{ parameter.value || '-' }}
        </span>
      </div>

      <!-- Description -->
      <div class="py-3 px-4 flex-1 min-w-32">
        <UTooltip v-if="description && description !== '-'" :text="description" :popper="{ placement: 'top' }">
          <span class="text-sm text-gray-600 dark:text-gray-400 block truncate">
            {{ description }}
          </span>
        </UTooltip>
        <span v-else class="text-sm text-gray-600 dark:text-gray-400"> - </span>
      </div>
    </div>

    <!-- Children rows (recursive) -->
    <template v-if="hasChildren && isExpanded(nodeId)">
      <ParameterRow
        v-for="child in parameter.children"
        :key="getNodeId(child, nodeId)"
        :parameter="child"
        :level="level + 1"
        :parent-path="nodeId"
      />
    </template>
  </div>
</template>
