"""Browser smoke test for the Mini E-Commerce app.

Prerequisites:
  - Backend running on http://localhost:4000
  - Frontend running on http://localhost:5173
  - Python Playwright with Chromium installed

Run: python tests/ui-smoke-test.py
"""

import json
import re
import urllib.request

from playwright.sync_api import expect, sync_playwright

BASE_URL = "http://localhost:5173"
API_URL = "http://localhost:4000/api"
CART_KEY = "mini-ecommerce:cart:v1"
ORDER_ID_PATTERN = re.compile(r"^ord_[0-9a-f-]{36}$")


def api_get(path):
    with urllib.request.urlopen(f"{API_URL}{path}") as response:
        return json.loads(response.read().decode("utf-8"))


def read_cart(page):
    return json.loads(page.evaluate("localStorage.getItem('mini-ecommerce:cart:v1')") or "[]")


def assert_no_horizontal_overflow(page):
    overflow = page.evaluate(
        "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 1, f"Page overflows horizontally by {overflow}px"


def run_desktop_flow(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    page.goto(BASE_URL, wait_until="networkidle")
    expect(page.locator(".product-card")).to_have_count(5)

    names = page.locator(".product-name").all_inner_texts()
    assert names == [
        "Wireless Mouse",
        "Mechanical Keyboard",
        "USB-C Hub",
        "Bluetooth Speaker",
        "Laptop Stand",
    ], names

    prices = page.locator(".product-price").all_inner_texts()
    assert prices == ["₹799", "₹2,499", "₹1,299", "₹1,999", "₹899"], prices

    speaker = page.locator(".product-card", has_text="Bluetooth Speaker")
    assert "Out of stock" in speaker.inner_text()
    assert speaker.locator("button.product-add").is_disabled()

    page.screenshot(path="screenshots/desktop-products.png", full_page=True)

    search = page.get_by_label("Search products by name")
    search.fill("MOUSE")
    expect(page.locator(".product-card")).to_have_count(1)
    assert page.locator(".product-name").inner_text() == "Wireless Mouse"

    search.fill("no-such-product")
    expect(page.get_by_role("heading", name=re.compile("No products match"))).to_be_visible()
    page.locator(".search-clear").click()
    expect(page.locator(".product-card")).to_have_count(5)

    page.get_by_role("button", name="Add Wireless Mouse to cart").click()
    page.get_by_role("button", name="Add Wireless Mouse to cart").click()
    page.get_by_role("button", name="Add Mechanical Keyboard to cart").click()

    expect(page.locator(".header-cart-count")).to_have_text("3")
    expect(page.locator(".cart-line")).to_have_count(2)
    expect(page.locator(".cart-total-row strong")).to_have_text("₹4,097")

    assert read_cart(page) == [
        {"productId": "mouse", "quantity": 2},
        {"productId": "keyboard", "quantity": 1},
    ]

    page.reload(wait_until="networkidle")
    expect(page.locator(".product-card")).to_have_count(5)
    expect(page.locator(".header-cart-count")).to_have_text("3")
    expect(page.locator(".cart-line")).to_have_count(2)
    expect(page.locator(".cart-total-row strong")).to_have_text("₹4,097")
    assert read_cart(page) == [
        {"productId": "mouse", "quantity": 2},
        {"productId": "keyboard", "quantity": 1},
    ]

    page.route("**/api/orders", lambda route: route.abort("failed"))
    page.get_by_role("button", name="Place order").click()
    expect(page.locator(".alert-error")).to_be_visible()
    assert "Could not reach the store server" in page.locator(".alert-error").inner_text()
    expect(page.locator(".header-cart-count")).to_have_text("3")
    expect(page.locator(".cart-line")).to_have_count(2)
    expect(page.get_by_role("button", name="Place order")).to_be_enabled()
    page.unroute("**/api/orders")

    captured = {}

    def capture_order(route):
        captured["body"] = json.loads(route.request.post_data)
        route.continue_()

    page.route("**/api/orders", capture_order)
    page.get_by_role("button", name="Place order").click()
    expect(page.locator(".confirmation")).to_be_visible()
    page.unroute("**/api/orders", capture_order)

    assert captured["body"] == {
        "items": [
            {"productId": "mouse", "quantity": 2},
            {"productId": "keyboard", "quantity": 1},
        ]
    }, captured

    order_id = page.locator(".order-id").inner_text()
    assert ORDER_ID_PATTERN.match(order_id), order_id
    expect(page.locator(".order-total-row strong")).to_have_text("₹4,097")
    assert page.locator(".order-item-name").all_inner_texts() == [
        "Wireless Mouse",
        "Mechanical Keyboard",
    ]
    assert read_cart(page) == []
    page.screenshot(path="screenshots/desktop-confirmation.png", full_page=True)

    server_order = api_get(f"/orders/{order_id}")["order"]
    assert server_order["id"] == order_id
    assert server_order["total"] == 4097

    stock = {product["id"]: product["stock"] for product in api_get("/products")["products"]}
    assert stock["mouse"] == 8, stock
    assert stock["keyboard"] == 4, stock

    page.get_by_role("button", name="Continue shopping").click()
    expect(page.locator(".product-card")).to_have_count(5)
    expect(page.locator(".header-cart-count")).to_have_text("0")
    context.close()


def run_mobile_flow(browser):
    context = browser.new_context(viewport={"width": 375, "height": 812}, is_mobile=True)
    page = context.new_page()
    page.goto(BASE_URL, wait_until="networkidle")
    expect(page.locator(".product-card")).to_have_count(5)
    assert_no_horizontal_overflow(page)

    columns = page.evaluate(
        "() => getComputedStyle(document.querySelector('.product-grid')).gridTemplateColumns.split(' ').length"
    )
    assert columns == 1, f"Expected one mobile product column, found {columns}"
    page.screenshot(path="screenshots/mobile-products.png", full_page=True)

    page.get_by_role("button", name="Add USB-C Hub to cart").click()
    expect(page.locator(".header-cart-count")).to_have_text("1")
    page.locator(".header-cart-link").click()
    expect(page.locator(".cart-line-name")).to_have_text("USB-C Hub")
    assert_no_horizontal_overflow(page)
    page.screenshot(path="screenshots/mobile-cart.png", full_page=True)

    page.get_by_role("button", name="Place order").click()
    expect(page.locator(".confirmation")).to_be_visible()
    assert ORDER_ID_PATTERN.match(page.locator(".order-id").inner_text())
    expect(page.locator(".order-total-row strong")).to_have_text("₹1,299")
    assert_no_horizontal_overflow(page)
    page.screenshot(path="screenshots/mobile-confirmation.png", full_page=True)
    context.close()


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            run_desktop_flow(browser)
            run_mobile_flow(browser)
        finally:
            browser.close()

    print("UI smoke test passed: catalogue, search, cart, persistence, failure, checkout, order lookup, mobile layout.")


if __name__ == "__main__":
    main()
