#!/bin/bash

# ClawReef K8s 测试脚本

set -e

echo "=== ClawReef K8s 功能测试 ==="

BASE_URL="http://localhost:9001"

# 1. 登录
echo -e "\n1. 登录获取 Token..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "登录响应: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败"
    exit 1
fi

echo "✅ Token 获取成功"

# 2. 创建实例
echo -e "\n2. 创建测试实例..."
CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/instances" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "name": "test-debug",
    "type": "ubuntu",
    "cpu_cores": 1,
    "memory_gb": 2,
    "disk_gb": 10,
    "os_type": "ubuntu",
    "os_version": "22.04"
  }')

echo "创建响应: $CREATE_RESPONSE"

# 检查是否成功
if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ 实例创建成功"
    INSTANCE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "实例 ID: $INSTANCE_ID"
    
    # 3. 检查 K8s 资源
    echo -e "\n3. 检查 K8s 资源..."
    kubectl get pods -n clawreef-dev-user-1 2>/dev/null || echo "命名空间不存在或无法访问"
    kubectl get pvc -n clawreef-dev-user-1 2>/dev/null || echo "PVC 未创建"
    
    # 4. 删除测试实例
    echo -e "\n4. 清理测试实例..."
    curl -s -X DELETE "${BASE_URL}/api/v1/instances/${INSTANCE_ID}" \
      -H "Authorization: Bearer ${TOKEN}"
    echo "✅ 清理完成"
else
    echo "❌ 实例创建失败"
    echo "错误详情: $CREATE_RESPONSE"
fi

echo -e "\n=== 测试完成 ==="
