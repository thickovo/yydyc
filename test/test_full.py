import pytest
import requests
import json
import time

BASE_URL = "http://localhost:8080"
TEST_USER_ID = "test_user_001"


class TestWardrobeFullFlow:

    def setup_method(self):
        """每个测试方法执行前运行"""
        self.created_ids = []

    def teardown_method(self):
        """每个测试方法执行后运行，清理测试数据"""
        for _id in self.created_ids:
            try:
                requests.delete(f"{BASE_URL}/api/wardrobe/delete/{_id}")
            except:
                pass

    def _create_skirt(self, name="测试裙子", brand="TestBrand", price=399.00):
        """创建裙子"""
        payload = {
            "name": name,
            "brand": brand,
            "type": "JSK",
            "color": "#FFB6C1",
            "totalPrice": price,
            "deposit": 100.00,
            "finalPayment": price - 100.00,
            "userId": TEST_USER_ID,
            "status": 0,
            "category": "裙子",
            "size": "M",
            "note": "自动化测试数据"
        }
        resp = requests.post(f"{BASE_URL}/api/wardrobe/add", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        skirt_id = data["data"]
        self.created_ids.append(skirt_id)
        return skirt_id

    # ========== 增删改查全流程 ==========

    def test_full_crud_flow(self):
        """测试完整的增删改查流程"""
        print("\n=== 开始全流程测试 ===")

        # 1. 创建（Create）
        print("1. 测试创建...")
        skirt_id = self._create_skirt("全流程测试裙", "AutoTest")
        assert skirt_id is not None
        print(f"   ✅ 创建成功，ID: {skirt_id}")

        # 2. 查询（Read）
        print("2. 测试查询...")
        resp = requests.get(f"{BASE_URL}/api/wardrobe/detail/{skirt_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert data["data"]["name"] == "全流程测试裙"
        print(f"   ✅ 查询成功，名称: {data['data']['name']}")

        # 3. 更新（Update）
        print("3. 测试更新...")
        update_payload = {
            "id": skirt_id,
            "name": "全流程测试裙_已修改",
            "brand": "AutoTest_Updated",
            "userId": TEST_USER_ID
        }
        resp = requests.put(f"{BASE_URL}/api/wardrobe/update", json=update_payload)
        assert resp.status_code == 200
        assert resp.json()["code"] == 200
        print("   ✅ 更新成功")

        # 4. 验证更新结果
        resp = requests.get(f"{BASE_URL}/api/wardrobe/detail/{skirt_id}")
        assert resp.json()["data"]["name"] == "全流程测试裙_已修改"
        print("   ✅ 验证更新成功")

        # 5. 列表查询
        print("4. 测试列表查询...")
        resp = requests.get(
            f"{BASE_URL}/api/wardrobe/list",
            params={"userId": TEST_USER_ID, "page": 1, "size": 10}
        )
        assert resp.status_code == 200
        assert resp.json()["code"] == 200
        print(f"   ✅ 列表查询成功，总数: {resp.json()['data']['total']}")

        # 6. 删除（Delete）
        print("5. 测试删除...")
        resp = requests.delete(f"{BASE_URL}/api/wardrobe/delete/{skirt_id}")
        assert resp.status_code == 200
        assert resp.json()["code"] == 200
        print("   ✅ 删除成功")
        self.created_ids.remove(skirt_id)

        # 7. 验证删除结果
        resp = requests.get(f"{BASE_URL}/api/wardrobe/detail/{skirt_id}")
        assert resp.json()["code"] != 200
        print("   ✅ 验证删除成功")

        print("=== 全流程测试通过 ✅ ===")


class TestWardrobeListFilter:

    def test_list_with_filters(self):
        """测试列表筛选功能"""
        # 先创建一条测试数据
        payload = {
            "name": "筛选测试裙",
            "brand": "FilterTest",
            "type": "OP",
            "color": "#FFB6C1",
            "totalPrice": 299.00,
            "deposit": 0.00,
            "finalPayment": 0.00,
            "userId": TEST_USER_ID,
            "status": 0,
            "category": "裙子"
        }
        resp = requests.post(f"{BASE_URL}/api/wardrobe/add", json=payload)
        skirt_id = resp.json()["data"]

        try:
            # 按状态筛选
            resp = requests.get(
                f"{BASE_URL}/api/wardrobe/list",
                params={"userId": TEST_USER_ID, "status": 0, "page": 1, "size": 10}
            )
            assert resp.status_code == 200
            assert resp.json()["code"] == 200

            # 按类型筛选
            resp = requests.get(
                f"{BASE_URL}/api/wardrobe/list",
                params={"userId": TEST_USER_ID, "type": "OP", "page": 1, "size": 10}
            )
            assert resp.status_code == 200

            # 按关键词搜索
            resp = requests.get(
                f"{BASE_URL}/api/wardrobe/list",
                params={"userId": TEST_USER_ID, "keyword": "筛选测试", "page": 1, "size": 10}
            )
            assert resp.status_code == 200
            assert resp.json()["data"]["total"] > 0

            print("✅ 列表筛选测试通过")
        finally:
            requests.delete(f"{BASE_URL}/api/wardrobe/delete/{skirt_id}")


class TestStatistics:

    def test_statistics_overview(self):
        """测试统计总览接口"""
        resp = requests.get(
            f"{BASE_URL}/api/wardrobe/statistics/overview",
            params={"userId": TEST_USER_ID}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert "totalSpent" in data["data"]
        assert "totalCount" in data["data"]
        print("✅ 统计总览测试通过")

    def test_statistics_trend(self):
        """测试月度趋势接口"""
        resp = requests.get(
            f"{BASE_URL}/api/wardrobe/statistics/trend",
            params={"userId": TEST_USER_ID}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert isinstance(data["data"], list)
        print("✅ 月度趋势测试通过")

    def test_statistics_category(self):
        """测试分类统计接口"""
        resp = requests.get(
            f"{BASE_URL}/api/wardrobe/statistics/category",
            params={"userId": TEST_USER_ID}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert isinstance(data["data"], list)
        print("✅ 分类统计测试通过")


class TestCalendar:

    def test_calendar_summary(self):
        """测试尾款日历汇总"""
        resp = requests.get(
            f"{BASE_URL}/api/wardrobe/calendar/summary",
            params={"year": 2026, "userId": TEST_USER_ID}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert isinstance(data["data"], list)
        print("✅ 尾款日历汇总测试通过")

    def test_calendar_detail(self):
        """测试尾款日历明细"""
        resp = requests.get(
            f"{BASE_URL}/api/wardrobe/calendar/detail",
            params={"year": 2026, "month": 9, "userId": TEST_USER_ID}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert isinstance(data["data"], list)
        print("✅ 尾款日历明细测试通过")


class TestWish:

    def setup_method(self):
        self.created_ids = []

    def teardown_method(self):
        for _id in self.created_ids:
            try:
                requests.delete(f"{BASE_URL}/api/wish/delete/{_id}")
            except:
                pass

    def test_wish_crud(self):
        """测试心愿单完整流程"""
        # 创建心愿
        payload = {
            "name": "心愿测试裙",
            "brand": "WishTest",
            "price": 599.00,
            "userId": TEST_USER_ID,
            "note": "测试心愿单"
        }
        resp = requests.post(f"{BASE_URL}/api/wish/add", json=payload)
        assert resp.status_code == 200
        wish_id = resp.json()["data"]
        self.created_ids.append(wish_id)
        print(f"✅ 创建心愿成功，ID: {wish_id}")

        # 查询心愿列表
        resp = requests.get(
            f"{BASE_URL}/api/wish/list",
            params={"userId": TEST_USER_ID}
        )
        assert resp.status_code == 200
        assert resp.json()["code"] == 200
        print("✅ 查询心愿列表成功")

        # 删除心愿
        resp = requests.delete(f"{BASE_URL}/api/wish/delete/{wish_id}")
        assert resp.status_code == 200
        assert resp.json()["code"] == 200
        self.created_ids.remove(wish_id)
        print("✅ 删除心愿成功")


class TestBackup:

    def test_backup_export(self):
        """测试导出数据"""
        resp = requests.get(
            f"{BASE_URL}/api/backup/export",
            params={"userId": TEST_USER_ID}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert data["data"] is not None
        print("✅ 导出数据测试通过")


class TestAdmin:

    def test_admin_feedback_list(self):
        """测试管理员反馈列表"""
        resp = requests.get(
            f"{BASE_URL}/api/admin/feedback/list",
            params={"page": 1, "size": 10}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert "records" in data["data"]
        print("✅ 反馈列表测试通过")

    def test_admin_config_get(self):
        """测试获取配置"""
        resp = requests.get(
            f"{BASE_URL}/api/admin/config/get/remind_days"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == 200
        assert data["data"]["configKey"] == "remind_days"
        print("✅ 获取配置测试通过")