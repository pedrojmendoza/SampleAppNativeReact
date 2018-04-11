def test_basic(driver):
    WAIT_SEC = 10
    driver.implicitly_wait(WAIT_SEC)

    country_text = driver.find_element_by_accessibility_id('country_text')
    if country_text is None:
        raise AssertionError

    form_view = driver.find_element_by_accessibility_id('form_view_es')
    if form_view is None:
        raise AssertionError

    submit_button = driver.find_element_by_accessibility_id('submit_button_es')
    if submit_button is None:
        raise AssertionError
