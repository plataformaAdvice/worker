select * 
	from public.notice 
	inner join public.notice_course
	on notice.id = notice_course."noticeId"
	inner join public.courses 
	on notice_course."courseId" = courses.id
	inner join public.classroom
	on courses.id = classroom."courseId"
	inner join public.classroom_student
	on classroom.id = classroom_student."classroomId"
	inner join public.persons
	on classroom_student."personId" = persons.id
	where courses.active = true 
	AND classroom.active = true
	AND classroom_student.active = true
	AND persons.active = true
	AND notice.id = $1;