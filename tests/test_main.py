def test_basic(driver):
    WAIT_SEC = 10
    driver.implicitly_wait(WAIT_SEC)

    form_view = driver.find_element_by_accessibility_id('form_view')
    if form_view is None:
        raise AssertionError

    submit_button = driver.find_element_by_accessibility_id('submit_button')
    if submit_button is None:
        raise AssertionError
