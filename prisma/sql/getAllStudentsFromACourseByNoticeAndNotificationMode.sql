SELECT 
	notice.id AS notice_id,
	persons.id AS person_id,
	persons.fullname AS person_fullname,
	persons.email AS person_email,
	users."notificationMode" AS user_notification_mode
FROM public.notice 
INNER JOIN public.notice_course
ON notice.id = notice_course."noticeId"
INNER JOIN public.courses 
ON notice_course."courseId" = courses.id
INNER JOIN public.classroom
ON courses.id = classroom."courseId"
INNER JOIN public.classroom_student
ON classroom.id = classroom_student."classroomId"
INNER JOIN public.persons
ON classroom_student."personId" = persons.id
INNER JOIN public.users
ON persons."userId" = users.id
WHERE courses.active = true 
	AND classroom.active = true
	AND classroom_student.active = true
	AND persons.active = true
	AND users.active = true
	AND notice.id = $1
	AND users."notificationMode" = $2::"NotificationMode"
GROUP BY notice_id, person_id, user_notification_mode;