def test_basic(driver):
    WAIT_SEC = 10
    driver.implicitly_wait(WAIT_SEC)

    form_view = driver.find_element_by_accessibility_id('form_view')
    assert form_view is not None

    submit_button = driver.find_element_by_accessibility_id('submit_button')
    assert submit_button is not None
